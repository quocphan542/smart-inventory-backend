package com.quocphan.smartinventorybackend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "units")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Unit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "unit_name", columnDefinition = "nvarchar(100)")
    private String unitName;

    @Column(columnDefinition = "nvarchar(510)")
    private String description;
}