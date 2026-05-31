package com.quocphan.smartinventorybackend.repository;

import com.quocphan.smartinventorybackend.entity.Product;
import com.quocphan.smartinventorybackend.entity.Unit;
import com.quocphan.smartinventorybackend.entity.UnitConversion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UnitConversionRepository extends JpaRepository<UnitConversion, Integer> {
    List<UnitConversion> findByProduct_Id(Integer productId);
    Optional<UnitConversion> findByProductAndFromUnitAndToUnit(Product product, Unit fromUnit, Unit toUnit);
}