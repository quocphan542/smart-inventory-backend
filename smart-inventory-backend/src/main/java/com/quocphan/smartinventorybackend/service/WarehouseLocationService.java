package com.quocphan.smartinventorybackend.service;

import com.quocphan.smartinventorybackend.dto.WarehouseLocationDto;
import java.util.List;

public interface WarehouseLocationService {
    List<WarehouseLocationDto> getAllLocations();
    WarehouseLocationDto getLocationById(Integer id);
    List<WarehouseLocationDto> getLocationsByWarehouseId(Integer warehouseId);
    WarehouseLocationDto createLocation(WarehouseLocationDto locationDto);
    WarehouseLocationDto updateLocation(Integer id, WarehouseLocationDto locationDto);
    void deleteLocation(Integer id);
}
