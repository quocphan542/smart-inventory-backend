package com.quocphan.smartinventorybackend.controller;

import com.quocphan.smartinventorybackend.dto.AdjustmentDto;
import com.quocphan.smartinventorybackend.dto.AdjustmentRequestDto;
import com.quocphan.smartinventorybackend.entity.InventoryAdjustment;
import com.quocphan.smartinventorybackend.service.AdjustmentService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/adjustments")
@RequiredArgsConstructor
public class AdjustmentController {

    private static final Logger logger = LoggerFactory.getLogger(AdjustmentController.class);
    private final AdjustmentService adjustmentService;

    @GetMapping
    public ResponseEntity<?> getAllAdjustments() {
        try {
            List<AdjustmentDto> adjustments = adjustmentService.getAllAdjustments();
            return ResponseEntity.ok(adjustments);
        } catch (Exception e) {
            logger.error("Error fetching all adjustments", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching all adjustments");
        }
    }

    @PostMapping
    public ResponseEntity<?> createAdjustment(@RequestBody AdjustmentRequestDto requestDto) {
        try {
            InventoryAdjustment createdAdjustment = adjustmentService.createAdjustment(requestDto);
            return ResponseEntity.ok(createdAdjustment);
        } catch (Exception e) {
            logger.error("Error creating adjustment", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error creating adjustment");
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAdjustment(@PathVariable Integer id, @RequestBody AdjustmentRequestDto requestDto) {
        try {
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error updating adjustment with id: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating adjustment");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAdjustment(@PathVariable Integer id) {
        try {
            adjustmentService.deleteAdjustment(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("Error deleting adjustment with id: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deleting adjustment");
        }
    }
}