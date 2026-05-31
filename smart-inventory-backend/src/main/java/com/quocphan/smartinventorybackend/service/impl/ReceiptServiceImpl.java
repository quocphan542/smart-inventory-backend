package com.quocphan.smartinventorybackend.service.impl;

import com.quocphan.smartinventorybackend.dto.ReceiptDetailDto;
import com.quocphan.smartinventorybackend.dto.ReceiptRequestDto;
import com.quocphan.smartinventorybackend.entity.*;
import com.quocphan.smartinventorybackend.exception.ResourceNotFoundException;
import com.quocphan.smartinventorybackend.repository.*;
import com.quocphan.smartinventorybackend.service.InventoryStockService;
import com.quocphan.smartinventorybackend.service.ReceiptService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Triển khai interface ReceiptService.
 * Chịu trách nhiệm xử lý các nghiệp vụ liên quan đến Nhập kho.
 */
@Service
@RequiredArgsConstructor
public class ReceiptServiceImpl implements ReceiptService {

    private final InventoryReceiptRepository receiptRepository;
    private final ReceiptDetailRepository detailRepository;
    private final InventoryStockService stockService;
    private final InventoryLogRepository logRepository;
    private final WarehouseLocationRepository locationRepository;
    private final ProductRepository productRepository;
    private final UnitRepository unitRepository;
    private final UnitConversionRepository conversionRepository;

    /**
     * Tạo phiếu nhập kho mới.
     * Quá trình này bao gồm: lưu phiếu nhập, chuyển đổi đơn vị tính (nếu cần),
     * cập nhật số lượng tồn kho vật lý và ghi log.
     *
     * @param requestDto Dữ liệu của phiếu nhập.
     * @return Phiếu nhập đã được tạo.
     */
    @Override
    @Transactional
    public InventoryReceipt createReceipt(ReceiptRequestDto requestDto) {
        InventoryReceipt receipt = new InventoryReceipt();
        receipt.setReceiptCode(requestDto.getReceiptCode());
        receipt.setWarehouse(new Warehouse(requestDto.getWarehouseId()));
        receipt.setSupplier(new Supplier(requestDto.getSupplierId()));
        receipt.setCreatedBy(requestDto.getCreatedBy());
        receipt.setNotes(requestDto.getNotes());
        receipt.setReceiptDate(requestDto.getReceiptDate());
        InventoryReceipt savedReceipt = receiptRepository.save(receipt);

        WarehouseLocation targetLocation = locationRepository.findFirstByWarehouseId(savedReceipt.getWarehouse().getId())
                .orElseThrow(() -> new ResourceNotFoundException("No default location configured for warehouse id: " + savedReceipt.getWarehouse().getId()));

        for (ReceiptDetailDto detailDto : requestDto.getDetails()) {
            Product product = productRepository.findById(detailDto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + detailDto.getProductId()));
            Unit unit = unitRepository.findById(detailDto.getUnitId())
                    .orElseThrow(() -> new ResourceNotFoundException("Unit not found with id: " + detailDto.getUnitId()));
            Unit baseUnit = product.getBaseUnit();

            int originalQuantity = detailDto.getQuantity();
            int convertedQuantity = originalQuantity;

            if (baseUnit != null && !unit.getId().equals(baseUnit.getId())) {
                UnitConversion conversion = conversionRepository
                        .findByProductAndFromUnitAndToUnit(product, unit, baseUnit)
                        .orElseThrow(() -> new IllegalArgumentException(
                                "No conversion rule found for product '" + product.getProductName() +
                                "' from '" + unit.getUnitName() + "' to '" + baseUnit.getUnitName() + "'"));

                convertedQuantity = new BigDecimal(originalQuantity).multiply(conversion.getFactor()).intValue();
            }

            ReceiptDetail detail = new ReceiptDetail();
            detail.setInventoryReceipt(savedReceipt);
            detail.setProduct(product);
            detail.setQuantity(originalQuantity);
            detail.setUnitId(unit.getId());
            detail.setUnitPrice(detailDto.getUnitPrice());
            detail.setBatchNumber(detailDto.getBatchNumber());
            detail.setExpiryDate(detailDto.getExpiryDate());
            detailRepository.save(detail);

            stockService.updateStockFromReceipt(
                    product.getId(),
                    targetLocation.getId(),
                    detail.getBatchNumber(),
                    convertedQuantity,
                    detail.getExpiryDate()
            );

            InventoryLog log = new InventoryLog();
            log.setProductId(product.getId());
            log.setWarehouse(savedReceipt.getWarehouse());
            log.setTransactionType("RECEIPT");
            log.setQuantity(convertedQuantity);
            log.setTransactionId(savedReceipt.getId());
            log.setCreatedAt(LocalDateTime.now());
            logRepository.save(log);
        }
        return savedReceipt;
    }
}