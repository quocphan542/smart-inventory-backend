package com.quocphan.smartinventorybackend.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class SupplierDto {
    private Integer id;
    private String supplierName;
    private String taxCode;
    private String phone;
    private String email;
    private String address;
    private Integer leadTimeDays;
    private BigDecimal reliabilityScore;
    private Boolean isActive;
}