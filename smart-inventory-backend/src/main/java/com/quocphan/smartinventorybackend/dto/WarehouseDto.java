package com.quocphan.smartinventorybackend.dto;

import lombok.Data;

@Data
public class WarehouseDto {
    private Integer id;
    private String warehouseName;
    private String address;
    private Boolean isActive; // Đã thêm
}