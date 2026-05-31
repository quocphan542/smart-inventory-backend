package com.quocphan.smartinventorybackend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class IssueRequestDto {
    private String issueCode;
    private Integer customerId;
    private Integer warehouseId;
    private Integer createdBy;
    private LocalDateTime issueDate;
    private String notes;
    private String issueStatus;
    private BigDecimal totalAmount;
    private List<IssueDetailDto> details;
}