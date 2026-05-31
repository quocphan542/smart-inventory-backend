package com.quocphan.smartinventorybackend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "unit_conversions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class UnitConversion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_unit_id")
    private Unit fromUnit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_unit_id")
    private Unit toUnit;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal factor;
}