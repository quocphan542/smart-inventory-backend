package com.quocphan.smartinventorybackend.controller;

import com.quocphan.smartinventorybackend.dto.UnitDto;
import com.quocphan.smartinventorybackend.service.UnitService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/units")
@RequiredArgsConstructor
public class UnitController {

    private final UnitService unitService;

    @GetMapping
    public ResponseEntity<List<UnitDto>> getAllUnits() {
        return ResponseEntity.ok(unitService.getAllUnits());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UnitDto> getUnitById(@PathVariable Integer id) {
        return ResponseEntity.ok(unitService.getUnitById(id));
    }

    @PostMapping
    public ResponseEntity<UnitDto> createUnit(@RequestBody UnitDto unitDto) {
        return new ResponseEntity<>(unitService.createUnit(unitDto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UnitDto> updateUnit(@PathVariable Integer id, @RequestBody UnitDto unitDto) {
        return ResponseEntity.ok(unitService.updateUnit(id, unitDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUnit(@PathVariable Integer id) {
        unitService.deleteUnit(id);
        return ResponseEntity.noContent().build();
    }
}
