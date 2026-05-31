package com.quocphan.smartinventorybackend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "role_name", nullable = false, unique = true, columnDefinition = "nvarchar(100)")
    private String roleName;

    @Column(columnDefinition = "nvarchar(510)")
    private String description;

    public Role(String roleName) {
        this.roleName = roleName;
    }
}