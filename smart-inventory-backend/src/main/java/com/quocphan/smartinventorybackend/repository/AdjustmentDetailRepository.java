package com.quocphan.smartinventorybackend.repository;

import com.quocphan.smartinventorybackend.entity.AdjustmentDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface AdjustmentDetailRepository extends JpaRepository<AdjustmentDetail, Integer> {
    @Modifying
    @Query("DELETE FROM AdjustmentDetail ad WHERE ad.inventoryAdjustment.id = ?1")
    void deleteByInventoryAdjustmentId(Integer inventoryAdjustmentId);
}