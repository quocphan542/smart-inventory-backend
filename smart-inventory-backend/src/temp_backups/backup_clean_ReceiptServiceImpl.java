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

    @Override
    @Transactional
    public InventoryReceipt createReceipt(ReceiptRequestDto requestDto) {
        // 1. Create and save the main receipt
        InventoryReceipt receipt = new InventoryReceipt();
        receipt.setReceiptCode(requestDto.getReceiptCode());
        receipt.setWarehouse(new Warehouse(requestDto.getWarehouseId()));
        receipt.setSupplier(new Supplier(requestDto.getSupplierId()));
        receipt.setCreatedBy(requestDto.getCreatedBy());
        receipt.setNotes(requestDto.getNotes());
        receipt.setReceiptDate(requestDto.getReceiptDate());
        InventoryReceipt savedReceipt = receiptRepository.save(receipt);

        // Find a default location for stocking
        WarehouseLocation targetLocation = locationRepository.findFirstByWarehouseId(savedReceipt.getWarehouse().getId())
                .orElseThrow(() -> new ResourceNotFoundException("No default location configured for warehouse id: " + savedReceipt.getWarehouse().getId()));

        // 2. Loop through details
        for (ReceiptDetailDto detailDto : requestDto.getDetails()) {
            Product product = productRepository.findById(detailDto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + detailDto.getProductId()));
            Unit unit = unitRepository.findById(detailDto.getUnitId())
                    .orElseThrow(() -> new ResourceNotFoundException("Unit not found with id: " + detailDto.getUnitId()));
            Unit baseUnit = product.getBaseUnit();

            int originalQuantity = detailDto.getQuantity();
            int convertedQuantity = originalQuantity;

            // 3. Perform unit conversion if necessary
            if (baseUnit != null && !unit.getId().equals(baseUnit.getId())) {
                UnitConversion conversion = conversionRepository
                        .findByProductAndFromUnitAndToUnit(product, unit, baseUnit)
                        .orElseThrow(() -> new IllegalArgumentException(
                                "No conversion rule found for product '" + product.getProductName() +
                                "' from '" + unit.getUnitName() + "' to '" + baseUnit.getUnitName() + "'"));

                convertedQuantity = new BigDecimal(originalQuantity).multiply(conversion.getFactor()).intValue();
            }

            // 4. Save the receipt detail with original quantity and unit
            ReceiptDetail detail = new ReceiptDetail();
            detail.setInventoryReceipt(savedReceipt);
            detail.setProduct(product);
            detail.setQuantity(originalQuantity);
            detail.setUnitId(unit.getId());
            detail.setUnitPrice(detailDto.getUnitPrice());
            detail.setBatchNumber(detailDto.getBatchNumber());
            detail.setExpiryDate(detailDto.getExpiryDate());
            detailRepository.save(detail);

            // 5. Update stock with the converted quantity
            stockService.updateStockFromReceipt(
                    product.getId(),
                    targetLocation.getId(),
                    detail.getBatchNumber(),
                    convertedQuantity,
                    detail.getExpiryDate()
            );

            // 6. Log the transaction with the converted quantity
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