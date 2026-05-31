package com.quocphan.smartinventorybackend.service.impl;

import com.quocphan.smartinventorybackend.dto.InventoryStockDto;
import com.quocphan.smartinventorybackend.entity.InventoryStock;
import com.quocphan.smartinventorybackend.entity.Product;
import com.quocphan.smartinventorybackend.entity.WarehouseLocation;
import com.quocphan.smartinventorybackend.exception.ResourceNotFoundException;
import com.quocphan.smartinventorybackend.repository.InventoryStockRepository;
import com.quocphan.smartinventorybackend.repository.ProductRepository;
import com.quocphan.smartinventorybackend.repository.WarehouseLocationRepository;
import com.quocphan.smartinventorybackend.service.InventoryStockService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryStockServiceImpl implements InventoryStockService {

    private final InventoryStockRepository stockRepository;
    private final WarehouseLocationRepository locationRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public List<InventoryStockDto> getAllStocks() {
        return stockRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void updateStockFromReceipt(Integer productId, Integer locationId, String batchNumber, int quantity, LocalDate expiryDate) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
        WarehouseLocation location = locationRepository.findById(locationId)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + locationId));

        Optional<InventoryStock> existingStockOpt = stockRepository.findByProductAndLocationAndBatchNumber(product, location, batchNumber);

        if (existingStockOpt.isPresent()) {
            InventoryStock stock = existingStockOpt.get();
            stock.setQuantity(stock.getQuantity() + quantity);
            stock.setLastUpdated(LocalDateTime.now());
            stock.setExpiryDate(expiryDate); // Cập nhật expiryDate
            stockRepository.save(stock);
        } else {
            InventoryStock newStock = new InventoryStock();
            newStock.setProduct(product);
            newStock.setLocation(location);
            newStock.setBatchNumber(batchNumber);
            newStock.setQuantity(quantity);
            newStock.setExpiryDate(expiryDate);
            newStock.setLastUpdated(LocalDateTime.now());
            stockRepository.save(newStock);
        }
    }

    @Override
    @Transactional
    public void updateStockFromIssue(Integer productId, Integer warehouseId, String batchNumber, int quantity) {
        // SỬA LẠI THỨ TỰ THAM SỐ CHO ĐÚNG
        List<InventoryStock> stocks = stockRepository.findByProduct_IdAndLocation_Warehouse_IdAndBatchNumber(productId, warehouseId, batchNumber);

        if (stocks.isEmpty()) {
            throw new ResourceNotFoundException("Stock not found for product " + productId + ", batch " + batchNumber + " in warehouse " + warehouseId);
        }

        InventoryStock stock = stocks.get(0);

        if (stock.getQuantity() < quantity) {
            throw new IllegalArgumentException("Insufficient stock for product " + productId + ". Requested: " + quantity + ", Available: " + stock.getQuantity());
        }

        stock.setQuantity(stock.getQuantity() - quantity);
        stock.setLastUpdated(LocalDateTime.now());
        stockRepository.save(stock);
    }

    private InventoryStockDto convertToDto(InventoryStock stock) {
        InventoryStockDto dto = new InventoryStockDto();
        
        if (stock.getProduct() != null) {
            dto.setProductId(stock.getProduct().getId());
            dto.setSku(stock.getProduct().getSku());
            dto.setProductName(stock.getProduct().getProductName());
            dto.setBasePrice(stock.getProduct().getBasePrice());
            if (stock.getProduct().getCategory() != null) {
                dto.setCategoryId(stock.getProduct().getCategory().getId());
                dto.setCategoryName(stock.getProduct().getCategory().getCategoryName());
            }
        }
        
        if (stock.getLocation() != null) {
            dto.setLocationId(stock.getLocation().getId());
            dto.setZoneCode(stock.getLocation().getZoneCode());
            dto.setShelfCode(stock.getLocation().getShelfCode());
            dto.setBinCode(stock.getLocation().getBinCode());
            if (stock.getLocation().getWarehouse() != null) {
                dto.setWarehouseId(stock.getLocation().getWarehouse().getId());
                dto.setWarehouseName(stock.getLocation().getWarehouse().getWarehouseName());
            }
        }
        
        dto.setBatchNumber(stock.getBatchNumber());
        dto.setQuantity(stock.getQuantity());
        dto.setExpiryDate(stock.getExpiryDate());
        
        return dto;
    }
}