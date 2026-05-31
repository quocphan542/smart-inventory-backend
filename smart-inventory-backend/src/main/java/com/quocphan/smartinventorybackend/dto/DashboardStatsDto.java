package com.quocphan.smartinventorybackend.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class DashboardStatsDto {
    private BigDecimal totalStockValuation;
    private Long pendingUserActivations;
    private List<InventoryLogDto> recentLogs;
    private AiDemandForecastDto latestForecast;
}