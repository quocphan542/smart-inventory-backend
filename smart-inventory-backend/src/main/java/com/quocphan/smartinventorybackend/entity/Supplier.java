package com.quocphan.smartinventorybackend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "suppliers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Supplier {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "supplier_name", nullable = false, columnDefinition = "nvarchar(510)")
    private String supplierName;

    @Column(name = "tax_code", length = 20)
    private String taxCode;

    @Column(length = 20)
    private String phone;

    @Column(length = 255)
    private String email;
    
    @Column(columnDefinition = "nvarchar(1000)")
    private String address;

    @Column(name = "lead_time_days")
    private Integer leadTimeDays;

    @Column(name = "reliability_score", precision = 3, scale = 2)
    private BigDecimal reliabilityScore;

    @Column(name = "is_active")
    private Boolean isActive = true;

    public Supplier(Integer id) {
        this.id = id;
    }
}