package com.quocphan.smartinventorybackend.repository;

import com.quocphan.smartinventorybackend.entity.InventoryAdjustment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface InventoryAdjustmentRepository extends JpaRepository<InventoryAdjustment, Integer> {
    @Modifying
    @Query("UPDATE InventoryAdjustment a SET a.createdBy = :newUserId WHERE a.createdBy = :oldUserId")
    void reassignCreatedBy(@Param("oldUserId") Integer oldUserId, @Param("newUserId") Integer newUserId);
}