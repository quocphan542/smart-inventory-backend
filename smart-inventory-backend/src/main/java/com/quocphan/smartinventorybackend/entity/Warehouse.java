package com.quocphan.smartinventorybackend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "warehouses")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Warehouse {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "warehouse_name", nullable = false, columnDefinition = "nvarchar(100)")
    private String warehouseName;

    @Column(columnDefinition = "nvarchar(500)")
    private String address;

    @Column(name = "is_active")
    private Boolean isActive = true;

    public Warehouse(Integer id) {
        this.id = id;
    }
}