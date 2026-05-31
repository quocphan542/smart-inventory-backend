package com.quocphan.smartinventorybackend.dto;

import lombok.Data;

@Data
public class CustomerDto {
    private Integer id;
    private String customerName;
    private String phone;
    private String email;
    private String address;
    private Boolean isActive;
    private Integer userId; // THÊM MỚI
}