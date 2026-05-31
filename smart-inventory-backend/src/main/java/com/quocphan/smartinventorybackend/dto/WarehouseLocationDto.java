package com.quocphan.smartinventorybackend.dto;

import lombok.Data;

@Data
public class WarehouseLocationDto {
    private Integer id;
    private Integer warehouseId;
    private String warehouseName;
    private String zoneCode;
    private String shelfCode;
    private String binCode;
    private String description;
}
