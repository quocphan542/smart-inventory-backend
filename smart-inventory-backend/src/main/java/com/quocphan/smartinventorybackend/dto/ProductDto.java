package com.quocphan.smartinventorybackend.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductDto {
    private Integer id;
    private String sku;
    private String productName;
    private String imageUrl;
    private Integer minimumStock;
    private BigDecimal basePrice;
    private BigDecimal salePrice; // THÊM MỚI
    private Integer categoryId;
    private String categoryName;
    private Integer baseUnitId;
    private String baseUnitName;
    private Boolean isActive;
}