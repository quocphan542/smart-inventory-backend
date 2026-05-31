package com.quocphan.smartinventorybackend.service.impl;

import com.quocphan.smartinventorybackend.dto.WarehouseDto;
import com.quocphan.smartinventorybackend.entity.Warehouse;
import com.quocphan.smartinventorybackend.exception.ResourceNotFoundException;
import com.quocphan.smartinventorybackend.repository.WarehouseRepository;
import com.quocphan.smartinventorybackend.service.WarehouseService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WarehouseServiceImpl implements WarehouseService {

    private final WarehouseRepository warehouseRepository;

    @Override
    @Transactional(readOnly = true)
    public List<WarehouseDto> getAllWarehouses() {
        return warehouseRepository.findAll().stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public WarehouseDto getWarehouseById(Integer id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with id: " + id));
        return convertToDto(warehouse);
    }

    @Override
    @Transactional
    public WarehouseDto createWarehouse(WarehouseDto warehouseDto) {
        Warehouse warehouse = convertToEntity(warehouseDto);
        Warehouse savedWarehouse = warehouseRepository.save(warehouse);
        return convertToDto(savedWarehouse);
    }

    @Override
    @Transactional
    public WarehouseDto updateWarehouse(Integer id, WarehouseDto warehouseDto) {
        Warehouse existingWarehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with id: " + id));

        existingWarehouse.setWarehouseName(warehouseDto.getWarehouseName());
        existingWarehouse.setAddress(warehouseDto.getAddress());
        existingWarehouse.setIsActive(warehouseDto.getIsActive());

        Warehouse updatedWarehouse = warehouseRepository.save(existingWarehouse);
        return convertToDto(updatedWarehouse);
    }

    @Override
    @Transactional
    public void deleteWarehouse(Integer id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with id: " + id));
        try {
            warehouseRepository.delete(warehouse);
            warehouseRepository.flush(); // Ép JPA đẩy lệnh xuống DB ngay lập tức để bắt lỗi
        } catch (DataIntegrityViolationException e) {
            throw new IllegalArgumentException("Không thể xoá kho bãi này vì đang chứa hàng hóa, phiếu giao dịch hoặc vị trí kho. Vui lòng TẮT (OFFLINE) kho này thay vì xoá.");
        }
    }

    @Override
    @Transactional
    public void toggleWarehouseStatus(Integer id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with id: " + id));
        warehouse.setIsActive(!warehouse.getIsActive());
        warehouseRepository.save(warehouse);
    }

    private WarehouseDto convertToDto(Warehouse warehouse) {
        WarehouseDto dto = new WarehouseDto();
        dto.setId(warehouse.getId());
        dto.setWarehouseName(warehouse.getWarehouseName());
        dto.setAddress(warehouse.getAddress());
        dto.setIsActive(warehouse.getIsActive());
        return dto;
    }

    private Warehouse convertToEntity(WarehouseDto dto) {
        Warehouse warehouse = new Warehouse();
        warehouse.setWarehouseName(dto.getWarehouseName());
        warehouse.setAddress(dto.getAddress());
        if (dto.getIsActive() != null) {
            warehouse.setIsActive(dto.getIsActive());
        } else {
             warehouse.setIsActive(true);
        }
        return warehouse;
    }
}