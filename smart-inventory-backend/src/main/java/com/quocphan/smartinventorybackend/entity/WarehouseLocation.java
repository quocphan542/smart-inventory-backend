package com.quocphan.smartinventorybackend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "warehouse_locations")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class WarehouseLocation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "warehouse_id")
    private Warehouse warehouse;

    @Column(name = "zone_code", nullable = false, length = 20)
    private String zoneCode;

    @Column(name = "shelf_code", nullable = false, length = 20)
    private String shelfCode;

    @Column(name = "bin_code", nullable = false, length = 20)
    private String binCode;

    @Column(columnDefinition = "nvarchar(510)")
    private String description;
}