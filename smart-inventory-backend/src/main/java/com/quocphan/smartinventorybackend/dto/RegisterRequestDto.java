package com.quocphan.smartinventorybackend.dto;

import lombok.Data;

@Data
public class RegisterRequestDto {
    private String username;
    private String password; // Đã có
    private String fullName;
    private String email;
    private String phone;
    private Integer roleId;
    private Boolean isActive;
}