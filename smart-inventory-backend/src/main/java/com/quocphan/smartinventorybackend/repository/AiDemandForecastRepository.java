package com.quocphan.smartinventorybackend.repository;

import com.quocphan.smartinventorybackend.dto.AiDemandForecastDto;
import com.quocphan.smartinventorybackend.entity.AiDemandForecast;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiDemandForecastRepository extends JpaRepository<AiDemandForecast, Integer> {
    
    // Sử dụng Constructor Expression để tạo DTO trực tiếp từ query
    @Query("SELECT new com.quocphan.smartinventorybackend.dto.AiDemandForecastDto(f.id, p.id, p.productName, f.forecastDate, f.predictedDemand, f.confidenceInterval, f.createdAt) " +
           "FROM AiDemandForecast f JOIN f.product p")
    List<AiDemandForecastDto> findAllAsDto();

    List<AiDemandForecast> findByProductId(Integer productId);
}