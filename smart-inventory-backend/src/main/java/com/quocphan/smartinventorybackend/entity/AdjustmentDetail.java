package com.quocphan.smartinventorybackend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "adjustment_details")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class AdjustmentDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "adjustment_id")
    private InventoryAdjustment inventoryAdjustment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id")
    private WarehouseLocation location;

    @Column(name = "batch_number", length = 50)
    private String batchNumber;

    @Column(name = "system_qty")
    private Integer systemQty;

    @Column(name = "actual_qty")
    private Integer actualQty;

    @Column(name = "diff_qty")
    private Integer diffQty;
}