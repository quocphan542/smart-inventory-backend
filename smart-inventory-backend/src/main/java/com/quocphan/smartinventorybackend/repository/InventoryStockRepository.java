package com.quocphan.smartinventorybackend.repository;

import com.quocphan.smartinventorybackend.entity.InventoryStock;
import com.quocphan.smartinventorybackend.entity.InventoryStockId;
import com.quocphan.smartinventorybackend.entity.Product;
import com.quocphan.smartinventorybackend.entity.WarehouseLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryStockRepository extends JpaRepository<InventoryStock, InventoryStockId> {
    // Find by composite key using objects
    Optional<InventoryStock> findByProductAndLocationAndBatchNumber(Product product, WarehouseLocation location, String batchNumber);

    // Find by composite key using IDs
    Optional<InventoryStock> findByProductIdAndLocationIdAndBatchNumber(Integer productId, Integer locationId, String batchNumber);

    // Find all stocks for a product in a warehouse by batch
    List<InventoryStock> findByProduct_IdAndLocation_Warehouse_IdAndBatchNumber(Integer productId, Integer warehouseId, String batchNumber);
}