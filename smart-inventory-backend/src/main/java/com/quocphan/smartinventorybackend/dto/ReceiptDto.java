package com.quocphan.smartinventorybackend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReceiptDto {
    private Long id;
    private String receiptCode;
    private String supplierName;
    private LocalDateTime receivedDate;
    private String status; // Assuming a status field exists
}