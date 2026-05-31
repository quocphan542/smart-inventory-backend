package com.quocphan.smartinventorybackend.dto;

import lombok.Data;

@Data
public class LoginResponseDto {
    private String accessToken;
    private String tokenType = "Bearer";
    private String username;
    private String roleName;

    public LoginResponseDto(String accessToken, String username, String roleName) {
        this.accessToken = accessToken;
        this.username = username;
        this.roleName = roleName;
    }
}
