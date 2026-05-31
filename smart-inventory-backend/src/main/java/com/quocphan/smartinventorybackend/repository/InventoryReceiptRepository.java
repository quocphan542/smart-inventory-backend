package com.quocphan.smartinventorybackend.repository;

import com.quocphan.smartinventorybackend.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface InventoryReceiptRepository extends JpaRepository<InventoryReceipt, Integer> {
    @Modifying
    @Query("UPDATE InventoryReceipt r SET r.createdBy = :newUserId WHERE r.createdBy = :oldUserId")
    void reassignCreatedBy(@Param("oldUserId") Integer oldUserId, @Param("newUserId") Integer newUserId);
}