package com.quocphan.smartinventorybackend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class InventoryLogDto {
    private Long id; // Sửa từ Integer thành Long
    private Integer productId;
    private String productName;
    private String transactionType;
    private Integer quantity;
    private Integer transactionId;
    private LocalDateTime createdAt;
    private String operatorUsername; // To show who performed the action
}