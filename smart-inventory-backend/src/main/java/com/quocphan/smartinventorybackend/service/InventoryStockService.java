package com.quocphan.smartinventorybackend.service;

import com.quocphan.smartinventorybackend.dto.InventoryStockDto;
import java.util.List;
import java.time.LocalDate; // Import LocalDate

public interface InventoryStockService {
    List<InventoryStockDto> getAllStocks();
    
    void updateStockFromReceipt(Integer productId, Integer locationId, String batchNumber, int quantity, LocalDate expiryDate);
    void updateStockFromIssue(Integer productId, Integer warehouseId, String batchNumber, int quantity);
}