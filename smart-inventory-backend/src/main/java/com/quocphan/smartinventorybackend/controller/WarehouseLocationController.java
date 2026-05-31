package com.quocphan.smartinventorybackend.controller;

import com.quocphan.smartinventorybackend.dto.WarehouseLocationDto;
import com.quocphan.smartinventorybackend.service.WarehouseLocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/warehouse-locations")
@RequiredArgsConstructor
public class WarehouseLocationController {

    private final WarehouseLocationService locationService;

    @GetMapping
    public ResponseEntity<List<WarehouseLocationDto>> getAllLocations() {
        return ResponseEntity.ok(locationService.getAllLocations());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WarehouseLocationDto> getLocationById(@PathVariable Integer id) {
        return ResponseEntity.ok(locationService.getLocationById(id));
    }

    @GetMapping("/warehouse/{warehouseId}")
    public ResponseEntity<List<WarehouseLocationDto>> getLocationsByWarehouseId(@PathVariable Integer warehouseId) {
        return ResponseEntity.ok(locationService.getLocationsByWarehouseId(warehouseId));
    }

    @PostMapping
    public ResponseEntity<WarehouseLocationDto> createLocation(@RequestBody WarehouseLocationDto locationDto) {
        return new ResponseEntity<>(locationService.createLocation(locationDto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<WarehouseLocationDto> updateLocation(@PathVariable Integer id, @RequestBody WarehouseLocationDto locationDto) {
        return ResponseEntity.ok(locationService.updateLocation(id, locationDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLocation(@PathVariable Integer id) {
        locationService.deleteLocation(id);
        return ResponseEntity.noContent().build();
    }
}
