package com.quocphan.smartinventorybackend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class AiDemandForecastDto {
    private Integer id;
    private Integer productId;
    private String productName;
    private LocalDate forecastDate;
    private Integer predictedDemand;
    private BigDecimal confidenceInterval;
    private LocalDateTime createdAt;

    // Constructor Expression for JPQL
    public AiDemandForecastDto(Integer id, Integer productId, String productName, LocalDate forecastDate, Integer predictedDemand, BigDecimal confidenceInterval, LocalDateTime createdAt) {
        this.id = id;
        this.productId = productId;
        this.productName = productName;
        this.forecastDate = forecastDate;
        this.predictedDemand = predictedDemand;
        this.confidenceInterval = confidenceInterval;
        this.createdAt = createdAt;
    }
}