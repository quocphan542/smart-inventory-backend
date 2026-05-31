package com.quocphan.smartinventorybackend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "customers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "customer_name", nullable = false, columnDefinition = "nvarchar(510)")
    private String customerName;

    @Column(length = 20)
    private String phone;

    @Column(length = 100)
    private String email;
    
    @Column(columnDefinition = "nvarchar(1000)")
    private String address;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    public Customer(Integer id) {
        this.id = id;
    }
}