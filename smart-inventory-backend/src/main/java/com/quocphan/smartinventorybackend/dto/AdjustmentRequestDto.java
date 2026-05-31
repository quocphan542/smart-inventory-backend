package com.quocphan.smartinventorybackend.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class AdjustmentRequestDto {
    private String adjustmentCode;
    private Integer warehouseId;
    private Integer createdBy;
    private LocalDateTime adjustmentDate;
    private String reason;
    private List<AdjustmentDetailDto> details;
}