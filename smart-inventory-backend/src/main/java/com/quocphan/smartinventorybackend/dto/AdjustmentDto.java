package com.quocphan.smartinventorybackend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AdjustmentDto {
    private Integer id;
    private String adjustmentCode;
    private String reason;
    private LocalDateTime adjustmentDate;
    private String status;
}