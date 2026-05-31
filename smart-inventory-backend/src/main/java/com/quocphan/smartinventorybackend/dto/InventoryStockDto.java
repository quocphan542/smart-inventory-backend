package com.quocphan.smartinventorybackend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class InventoryStockDto {
    private Integer productId;
    private String sku;
    private String productName;
    
    private Integer categoryId;
    private String categoryName;
    
    private Integer warehouseId;
    private String warehouseName;
    
    private Integer locationId;
    private String zoneCode;
    private String shelfCode;
    private String binCode;
    
    private String batchNumber;
    private int quantity;
    private LocalDate expiryDate;
    private BigDecimal basePrice;
}