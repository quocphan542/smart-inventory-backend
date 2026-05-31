package com.quocphan.smartinventorybackend.service.impl;

import com.quocphan.smartinventorybackend.dto.AdjustmentDetailDto;
import com.quocphan.smartinventorybackend.dto.AdjustmentDto;
import com.quocphan.smartinventorybackend.dto.AdjustmentRequestDto;
import com.quocphan.smartinventorybackend.entity.*;
import com.quocphan.smartinventorybackend.exception.ResourceNotFoundException;
import com.quocphan.smartinventorybackend.repository.*;
import com.quocphan.smartinventorybackend.service.AdjustmentService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdjustmentServiceImpl implements AdjustmentService {

    private static final Logger logger = LoggerFactory.getLogger(AdjustmentServiceImpl.class);
    private final InventoryAdjustmentRepository adjustmentRepository;
    private final AdjustmentDetailRepository detailRepository;
    private final InventoryStockRepository stockRepository;
    private final InventoryLogRepository logRepository;
    private final ProductRepository productRepository;
    private final WarehouseLocationRepository locationRepository;

    @Override
    @Transactional
    public InventoryAdjustment createAdjustment(AdjustmentRequestDto requestDto) {
        InventoryAdjustment adjustment = new InventoryAdjustment();
        adjustment.setAdjustmentCode(requestDto.getAdjustmentCode());
        adjustment.setWarehouse(new Warehouse(requestDto.getWarehouseId()));
        adjustment.setCreatedBy(requestDto.getCreatedBy());
        adjustment.setAdjustmentDate(requestDto.getAdjustmentDate());
        adjustment.setReason(requestDto.getReason());
        InventoryAdjustment savedAdjustment = adjustmentRepository.save(adjustment);

        for (AdjustmentDetailDto detailDto : requestDto.getDetails()) {
            int diffQuantity = detailDto.getActualQuantity() - detailDto.getSystemQuantity();
            
            AdjustmentDetail detail = new AdjustmentDetail();
            detail.setInventoryAdjustment(savedAdjustment);
            
            Product product = productRepository.findById(detailDto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + detailDto.getProductId()));
            detail.setProduct(product);
            
            WarehouseLocation location = locationRepository.findById(detailDto.getLocationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + detailDto.getLocationId()));
            detail.setLocation(location);
            
            detail.setBatchNumber(detailDto.getBatchNumber());
            detail.setSystemQty(detailDto.getSystemQuantity());
            detail.setActualQty(detailDto.getActualQuantity());
            detail.setDiffQty(diffQuantity);
            detailRepository.save(detail);

            InventoryStock stockToUpdate = stockRepository.findByProductAndLocationAndBatchNumber(product, location, detail.getBatchNumber())
                    .orElseThrow(() -> new RuntimeException("Stock not found for Product ID: " + detail.getProduct().getId() +
                            ", Location ID: " + detail.getLocation().getId() + " and Batch: " + detail.getBatchNumber()));

            stockToUpdate.setQuantity(detail.getActualQty());
            stockToUpdate.setLastUpdated(LocalDateTime.now());
            stockRepository.save(stockToUpdate);

            if (diffQuantity != 0) {
                InventoryLog log = new InventoryLog();
                log.setProductId(detail.getProduct().getId());
                log.setWarehouse(savedAdjustment.getWarehouse());
                log.setTransactionType("ADJUSTMENT");
                log.setQuantity(diffQuantity);
                log.setTransactionId(savedAdjustment.getId());
                log.setCreatedAt(LocalDateTime.now());
                logRepository.save(log);
            }
        }

        return savedAdjustment;
    }

    @Override
    public List<AdjustmentDto> getAllAdjustments() {
        try {
            return adjustmentRepository.findAll().stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Error in getAllAdjustments", e);
            throw new RuntimeException("Could not fetch adjustments", e);
        }
    }

    @Override
    @Transactional
    public void deleteAdjustment(Integer id) {
        try {
            if (!adjustmentRepository.existsById(id)) {
                throw new ResourceNotFoundException("Adjustment not found with id: " + id);
            }
            detailRepository.deleteByInventoryAdjustmentId(id);
            adjustmentRepository.deleteById(id);
        } catch (Exception e) {
            logger.error("Error deleting adjustment with id: {}", id, e);
            throw new RuntimeException("Could not delete adjustment", e);
        }
    }

    private AdjustmentDto convertToDto(InventoryAdjustment adjustment) {
        AdjustmentDto dto = new AdjustmentDto();
        dto.setId(adjustment.getId());
        dto.setAdjustmentCode(adjustment.getAdjustmentCode());
        dto.setReason(adjustment.getReason());
        dto.setAdjustmentDate(adjustment.getAdjustmentDate());
        dto.setStatus("COMPLETED"); // Assuming logic
        return dto;
    }
}