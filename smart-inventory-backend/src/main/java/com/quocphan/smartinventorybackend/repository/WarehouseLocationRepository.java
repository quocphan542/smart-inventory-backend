package com.quocphan.smartinventorybackend.repository;

import com.quocphan.smartinventorybackend.entity.WarehouseLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WarehouseLocationRepository extends JpaRepository<WarehouseLocation, Integer> {
    Optional<WarehouseLocation> findFirstByWarehouseId(Integer warehouseId);
    List<WarehouseLocation> findByWarehouseId(Integer warehouseId);
}
