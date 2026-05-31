package com.quocphan.smartinventorybackend.repository;
import com.quocphan.smartinventorybackend.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface ReceiptDetailRepository extends JpaRepository<ReceiptDetail, Integer> {
    @Modifying
    @Query("DELETE FROM ReceiptDetail rd WHERE rd.inventoryReceipt.id = ?1")
    void deleteByInventoryReceiptId(Long inventoryReceiptId);
}