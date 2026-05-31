package com.quocphan.smartinventorybackend.service;

import com.quocphan.smartinventorybackend.dto.UnitDto;
import java.util.List;

public interface UnitService {
    List<UnitDto> getAllUnits();
    UnitDto getUnitById(Integer id);
    UnitDto createUnit(UnitDto unitDto);
    UnitDto updateUnit(Integer id, UnitDto unitDto);
    void deleteUnit(Integer id);
}
