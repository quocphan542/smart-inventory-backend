package com.quocphan.smartinventorybackend.repository;

import com.quocphan.smartinventorybackend.entity.Unit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UnitRepository extends JpaRepository<Unit, Integer> {
}