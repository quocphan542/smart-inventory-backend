package com.quocphan.smartinventorybackend.repository;
import com.quocphan.smartinventorybackend.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface IssueDetailRepository extends JpaRepository<IssueDetail, Integer> {
    @Modifying
    @Query("DELETE FROM IssueDetail id WHERE id.inventoryIssue.id = ?1")
    void deleteByInventoryIssueId(Integer inventoryIssueId);
}