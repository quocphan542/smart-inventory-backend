package com.quocphan.smartinventorybackend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserDto {
    private Integer id;
    private String username;
    private String fullName;
    private String email;
    private String phone;
    private Integer roleId;
    private String roleName;
    private Boolean isActive;
    private LocalDateTime createdAt;
}