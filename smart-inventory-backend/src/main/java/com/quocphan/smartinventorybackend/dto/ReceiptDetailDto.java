package com.quocphan.smartinventorybackend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ReceiptDetailDto {
    private Integer productId;
    private Integer quantity;
    private Integer unitId; // Đơn vị tính của số lượng nhập vào (e.g., ID của "Thùng")
    private BigDecimal unitPrice; // Đã đổi từ price thành unitPrice
    private String batchNumber;
    private LocalDate expiryDate;
}