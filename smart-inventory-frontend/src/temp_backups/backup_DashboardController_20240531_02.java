package com.quocphan.smartinventorybackend.controller;

import com.quocphan.smartinventorybackend.dto.AiDemandForecastDto;
import com.quocphan.smartinventorybackend.dto.DashboardStatsDto;
import com.quocphan.smartinventorybackend.dto.InventoryLogDto;
import com.quocphan.smartinventorybackend.service.AiDemandForecastService;
import com.quocphan.smartinventorybackend.service.InventoryLogService;
import com.quocphan.smartinventorybackend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final UserService userService;
    private final InventoryLogService logService;
    private final AiDemandForecastService forecastService;

    public DashboardController(UserService userService, InventoryLogService logService, AiDemandForecastService forecastService) {
        this.userService = userService;
        this.logService = logService;
        this.forecastService = forecastService;
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDto> getDashboardStats() {
        DashboardStatsDto stats = new DashboardStatsDto();

        // NOTE: These are placeholder implementations.
        // You should replace them with your actual business logic.

        // 1. Get Total Stock Valuation (Placeholder)
        stats.setTotalStockValuation(new BigDecimal("12750980.50"));

        // 2. Get Pending User Activations (Placeholder)
        stats.setPendingUserActivations(3L);

        // 3. Get Recent Logs
        List<InventoryLogDto> recentLogs = logService.getRecentLogs(5); // Get latest 5 logs
        stats.setRecentLogs(recentLogs);

        // 4. Get Latest Forecast (Placeholder)
        // In a real app, you'd get the most relevant forecast
        List<AiDemandForecastDto> forecasts = forecastService.getAllForecasts();
        if (forecasts != null && !forecasts.isEmpty()) {
            stats.setLatestForecast(forecasts.get(0));
        }

        return ResponseEntity.ok(stats);
    }
}