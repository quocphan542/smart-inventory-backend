package com.quocphan.smartinventorybackend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_issues")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class InventoryIssue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "issue_code", length = 255)
    private String issueCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id")
    private Warehouse warehouse;

    @Column(name = "created_by")
    private Integer createdBy;

    @Column(name = "issue_date")
    private LocalDateTime issueDate;

    @Column(columnDefinition = "nvarchar(510)")
    private String notes;

    @Column(name = "issue_status", length = 20, nullable = false)
    private String issueStatus;

    @Column(name = "total_amount", precision = 18, scale = 2, nullable = false)
    private BigDecimal totalAmount;
}