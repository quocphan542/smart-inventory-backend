package com.quocphan.smartinventorybackend.repository;

import com.quocphan.smartinventorybackend.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Integer> {
    Optional<Role> findByRoleName(String roleName);
    
    // THÊM HÀM CÒN THIẾU
    Optional<Role> findByRoleNameIgnoreCase(String roleName);
}