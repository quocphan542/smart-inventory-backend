package com.quocphan.smartinventorybackend.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class IssueDetailDto {
    private Integer productId;
    private Integer quantity;
    private Integer unitId; // Đơn vị tính của số lượng xuất ra
    private BigDecimal unitPrice;
    private String batchNumber;
}
