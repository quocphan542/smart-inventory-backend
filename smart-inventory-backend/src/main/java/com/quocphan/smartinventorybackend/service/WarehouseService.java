package com.quocphan.smartinventorybackend.service;

import com.quocphan.smartinventorybackend.dto.WarehouseDto;
import java.util.List;

public interface WarehouseService {
    List<WarehouseDto> getAllWarehouses();
    WarehouseDto getWarehouseById(Integer id);
    WarehouseDto createWarehouse(WarehouseDto warehouseDto);
    WarehouseDto updateWarehouse(Integer id, WarehouseDto warehouseDto);
    void deleteWarehouse(Integer id);
    void toggleWarehouseStatus(Integer id); // Thêm hàm toggle status
}