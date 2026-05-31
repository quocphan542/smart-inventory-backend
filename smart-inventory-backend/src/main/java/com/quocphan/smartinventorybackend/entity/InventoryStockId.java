package com.quocphan.smartinventorybackend.entity;

import lombok.*;
import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryStockId implements Serializable {
    private Integer product;
    private Integer location;
    private String batchNumber;
}