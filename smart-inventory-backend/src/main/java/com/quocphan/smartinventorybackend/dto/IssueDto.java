package com.quocphan.smartinventorybackend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class IssueDto {
    private Integer id;
    private String issueCode;
    private String customerName;
    private LocalDateTime issueDate;
    private String status;
}