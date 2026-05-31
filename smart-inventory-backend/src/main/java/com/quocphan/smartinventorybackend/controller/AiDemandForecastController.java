package com.quocphan.smartinventorybackend.controller;

import com.quocphan.smartinventorybackend.dto.AiDemandForecastDto;
import com.quocphan.smartinventorybackend.service.AiDemandForecastService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/forecasts")
@RequiredArgsConstructor
public class AiDemandForecastController {

    private final AiDemandForecastService forecastService;

    @GetMapping
    public ResponseEntity<List<AiDemandForecastDto>> getAllForecasts() {
        return ResponseEntity.ok(forecastService.getAllForecasts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AiDemandForecastDto> getForecastById(@PathVariable Integer id) {
        return ResponseEntity.ok(forecastService.getForecastById(id));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<AiDemandForecastDto>> getForecastsByProductId(@PathVariable Integer productId) {
        return ResponseEntity.ok(forecastService.getForecastsByProductId(productId));
    }

    @PostMapping
    public ResponseEntity<AiDemandForecastDto> createForecast(@RequestBody AiDemandForecastDto forecastDto) {
        return new ResponseEntity<>(forecastService.createForecast(forecastDto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AiDemandForecastDto> updateForecast(@PathVariable Integer id, @RequestBody AiDemandForecastDto forecastDto) {
        return ResponseEntity.ok(forecastService.updateForecast(id, forecastDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteForecast(@PathVariable Integer id) {
        forecastService.deleteForecast(id);
        return ResponseEntity.noContent().build();
    }
}
