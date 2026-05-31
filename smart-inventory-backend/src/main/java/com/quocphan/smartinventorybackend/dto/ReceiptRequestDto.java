package com.quocphan.smartinventorybackend.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ReceiptRequestDto {
    private String receiptCode;
    private Integer supplierId;
    private Integer warehouseId;
    private Integer createdBy;
    private LocalDateTime receiptDate;
    private String notes;
    private List<ReceiptDetailDto> details;
}