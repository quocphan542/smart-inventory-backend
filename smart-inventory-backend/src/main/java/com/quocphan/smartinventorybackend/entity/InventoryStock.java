package com.quocphan.smartinventorybackend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_stocks")
@IdClass(InventoryStockId.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class InventoryStock {
    @Id
    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    @Id
    @ManyToOne
    @JoinColumn(name = "location_id")
    private WarehouseLocation location;

    @Id
    @Column(name = "batch_number", length = 50)
    private String batchNumber;

    @Column(nullable = false)
    private Integer quantity = 0;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated = LocalDateTime.now();
}