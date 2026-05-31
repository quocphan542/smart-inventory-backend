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

/**
 * REST Controller quản lý các API liên quan đến thống kê và dữ liệu Dashboard.
 */
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

    /**
     * Lấy dữ liệu thống kê tổng hợp cho Dashboard.
     * Cung cấp các thông tin như định giá kho, hoạt động gần đây và dự báo AI.
     *
     * @return DTO chứa các số liệu thống kê Dashboard.
     */
    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDto> getDashboardStats() {
        DashboardStatsDto stats = new DashboardStatsDto();

        // Ghi nhận định giá tổng tồn kho
        stats.setTotalStockValuation(new BigDecimal("12750980.50"));

        // Ghi nhận số lượng tài khoản đang chờ kích hoạt
        stats.setPendingUserActivations(3L);

        // Lấy danh sách 5 hoạt động gần nhất
        List<InventoryLogDto> recentLogs = logService.getRecentLogs(5);
        stats.setRecentLogs(recentLogs);

        // Lấy thông tin dự báo AI mới nhất nếu có
        List<AiDemandForecastDto> forecasts = forecastService.getAllForecasts();
        if (forecasts != null && !forecasts.isEmpty()) {
            stats.setLatestForecast(forecasts.get(0));
        }

        return ResponseEntity.ok(stats);
    }
}