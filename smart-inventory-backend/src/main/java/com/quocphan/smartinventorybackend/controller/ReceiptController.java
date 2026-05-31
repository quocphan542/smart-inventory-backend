package com.quocphan.smartinventorybackend.controller;

import com.quocphan.smartinventorybackend.dto.ReceiptRequestDto;
import com.quocphan.smartinventorybackend.entity.InventoryReceipt;
import com.quocphan.smartinventorybackend.service.ReceiptService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/receipts")
@RequiredArgsConstructor
public class ReceiptController {

    private final ReceiptService receiptService;

    @PostMapping
    public ResponseEntity<InventoryReceipt> createReceipt(@RequestBody ReceiptRequestDto requestDto) {
        InventoryReceipt createdReceipt = receiptService.createReceipt(requestDto);
        return ResponseEntity.ok(createdReceipt);
    }
}