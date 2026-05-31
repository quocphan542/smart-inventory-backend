package com.quocphan.smartinventorybackend.repository;

import com.quocphan.smartinventorybackend.entity.InventoryLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InventoryLogRepository extends JpaRepository<InventoryLog, Integer> {
    // File này là interface và chỉ quản lý InventoryLog, không chứa code Service bạn nhé
}