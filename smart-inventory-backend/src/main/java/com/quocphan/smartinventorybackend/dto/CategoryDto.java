package com.quocphan.smartinventorybackend.dto;

import lombok.Data;

@Data
public class CategoryDto {
    private Integer id;
    private String categoryName;
    private Boolean isActive;
}
