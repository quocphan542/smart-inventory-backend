package com.quocphan.smartinventorybackend.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class UnitConversionDto {
    private Integer id;
    private Integer productId;
    private String productName;
    private Integer fromUnitId;
    private String fromUnitName;
    private Integer toUnitId;
    private String toUnitName;
    private BigDecimal factor;
}
