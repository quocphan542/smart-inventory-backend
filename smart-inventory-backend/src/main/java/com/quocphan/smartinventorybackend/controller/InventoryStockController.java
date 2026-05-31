package com.quocphan.smartinventorybackend.controller;

import com.quocphan.smartinventorybackend.dto.InventoryStockDto;
import com.quocphan.smartinventorybackend.service.InventoryStockService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/inventory-stocks")
@RequiredArgsConstructor
public class InventoryStockController {
    
    private final InventoryStockService stockService;

    @GetMapping
    public ResponseEntity<List<InventoryStockDto>> getAllStocks() { 
        return ResponseEntity.ok(stockService.getAllStocks()); 
    }
}