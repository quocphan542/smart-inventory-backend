package com.quocphan.smartinventorybackend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_adjustments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class InventoryAdjustment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "adjustment_code", length = 255)
    private String adjustmentCode;

    @ManyToOne
    @JoinColumn(name = "warehouse_id")
    private Warehouse warehouse;

    @Column(name = "created_by")
    private Integer createdBy;

    @Column(name = "adjustment_date")
    private LocalDateTime adjustmentDate = LocalDateTime.now();

    @Column(columnDefinition = "nvarchar(1000)")
    private String reason;
}