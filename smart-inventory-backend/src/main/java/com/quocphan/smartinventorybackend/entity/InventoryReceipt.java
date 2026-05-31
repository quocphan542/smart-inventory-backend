package com.quocphan.smartinventorybackend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_receipts")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class InventoryReceipt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "receipt_code", length = 255)
    private String receiptCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id")
    private Warehouse warehouse;

    @Column(name = "created_by")
    private Integer createdBy;

    @Column(name = "receipt_date")
    private LocalDateTime receiptDate;

    @Column(columnDefinition = "nvarchar(510)")
    private String notes;
}