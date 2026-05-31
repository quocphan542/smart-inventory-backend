package com.quocphan.smartinventorybackend.dto;

import lombok.Data;

@Data
public class AdjustmentDetailDto {
    private Integer productId;
    private Integer locationId;
    private String batchNumber;
    private Integer systemQuantity;
    private Integer actualQuantity;
}
