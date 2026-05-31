package com.quocphan.smartinventorybackend.repository;

import com.quocphan.smartinventorybackend.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface InventoryIssueRepository extends JpaRepository<InventoryIssue, Integer> {
    @Modifying
    @Query("UPDATE InventoryIssue i SET i.createdBy = :newUserId WHERE i.createdBy = :oldUserId")
    void reassignCreatedBy(@Param("oldUserId") Integer oldUserId, @Param("newUserId") Integer newUserId);
}