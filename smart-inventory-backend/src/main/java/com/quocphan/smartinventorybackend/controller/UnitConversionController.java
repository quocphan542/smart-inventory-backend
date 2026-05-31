package com.quocphan.smartinventorybackend.controller;

import com.quocphan.smartinventorybackend.dto.UnitConversionDto;
import com.quocphan.smartinventorybackend.service.UnitConversionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/unit-conversions")
@RequiredArgsConstructor
public class UnitConversionController {

    private final UnitConversionService conversionService;

    @GetMapping
    public ResponseEntity<List<UnitConversionDto>> getAllConversions() {
        return ResponseEntity.ok(conversionService.getAllConversions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UnitConversionDto> getConversionById(@PathVariable Integer id) {
        return ResponseEntity.ok(conversionService.getConversionById(id));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<UnitConversionDto>> getConversionsByProductId(@PathVariable Integer productId) {
        return ResponseEntity.ok(conversionService.getConversionsByProductId(productId));
    }

    @PostMapping
    public ResponseEntity<UnitConversionDto> createConversion(@RequestBody UnitConversionDto conversionDto) {
        return new ResponseEntity<>(conversionService.createConversion(conversionDto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UnitConversionDto> updateConversion(@PathVariable Integer id, @RequestBody UnitConversionDto conversionDto) {
        return ResponseEntity.ok(conversionService.updateConversion(id, conversionDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteConversion(@PathVariable Integer id) {
        conversionService.deleteConversion(id);
        return ResponseEntity.noContent().build();
    }
}
