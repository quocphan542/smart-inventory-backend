package com.quocphan.smartinventorybackend.service.impl;

import com.quocphan.smartinventorybackend.dto.WarehouseLocationDto;
import com.quocphan.smartinventorybackend.entity.Warehouse;
import com.quocphan.smartinventorybackend.entity.WarehouseLocation;
import com.quocphan.smartinventorybackend.exception.ResourceNotFoundException;
import com.quocphan.smartinventorybackend.repository.WarehouseLocationRepository;
import com.quocphan.smartinventorybackend.repository.WarehouseRepository;
import com.quocphan.smartinventorybackend.service.WarehouseLocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WarehouseLocationServiceImpl implements WarehouseLocationService {

    private final WarehouseLocationRepository locationRepository;
    private final WarehouseRepository warehouseRepository;

    @Override
    @Transactional(readOnly = true)
    public List<WarehouseLocationDto> getAllLocations() {
        return locationRepository.findAll().stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public WarehouseLocationDto getLocationById(Integer id) {
        WarehouseLocation location = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WarehouseLocation not found with id: " + id));
        return convertToDto(location);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WarehouseLocationDto> getLocationsByWarehouseId(Integer warehouseId) {
        // Sửa lỗi: Gọi đúng hàm findByWarehouseId được định nghĩa trong Repository
        return locationRepository.findByWarehouseId(warehouseId).stream()
                .map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public WarehouseLocationDto createLocation(WarehouseLocationDto locationDto) {
        WarehouseLocation location = convertToEntity(locationDto);
        WarehouseLocation savedLocation = locationRepository.save(location);
        return convertToDto(savedLocation);
    }

    @Override
    @Transactional
    public WarehouseLocationDto updateLocation(Integer id, WarehouseLocationDto locationDto) {
        WarehouseLocation existingLocation = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WarehouseLocation not found with id: " + id));

        Warehouse warehouse = warehouseRepository.findById(locationDto.getWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with id: " + locationDto.getWarehouseId()));

        existingLocation.setWarehouse(warehouse);
        existingLocation.setZoneCode(locationDto.getZoneCode());
        existingLocation.setShelfCode(locationDto.getShelfCode());
        existingLocation.setBinCode(locationDto.getBinCode());
        existingLocation.setDescription(locationDto.getDescription());

        WarehouseLocation updatedLocation = locationRepository.save(existingLocation);
        return convertToDto(updatedLocation);
    }

    @Override
    @Transactional
    public void deleteLocation(Integer id) {
        WarehouseLocation location = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WarehouseLocation not found with id: " + id));
        try {
            locationRepository.delete(location);
            locationRepository.flush(); // Ép JPA đẩy lệnh xuống DB ngay lập tức
        } catch (DataIntegrityViolationException e) {
            throw new IllegalArgumentException("Không thể xoá vị trí này vì đang có hàng hóa (Tồn kho) đặt tại đây.");
        }
    }

    private WarehouseLocationDto convertToDto(WarehouseLocation location) {
        WarehouseLocationDto dto = new WarehouseLocationDto();
        dto.setId(location.getId());
        if (location.getWarehouse() != null) {
            dto.setWarehouseId(location.getWarehouse().getId());
        }
        dto.setZoneCode(location.getZoneCode());
        dto.setShelfCode(location.getShelfCode());
        dto.setBinCode(location.getBinCode());
        dto.setDescription(location.getDescription());
        return dto;
    }

    private WarehouseLocation convertToEntity(WarehouseLocationDto dto) {
        WarehouseLocation location = new WarehouseLocation();
        
        Warehouse warehouse = warehouseRepository.findById(dto.getWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with id: " + dto.getWarehouseId()));
        location.setWarehouse(warehouse);
        
        location.setZoneCode(dto.getZoneCode());
        location.setShelfCode(dto.getShelfCode());
        location.setBinCode(dto.getBinCode());
        location.setDescription(dto.getDescription());
        return location;
    }
}