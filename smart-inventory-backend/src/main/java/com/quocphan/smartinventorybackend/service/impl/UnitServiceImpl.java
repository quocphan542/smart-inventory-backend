package com.quocphan.smartinventorybackend.service.impl;

import com.quocphan.smartinventorybackend.dto.UnitDto;
import com.quocphan.smartinventorybackend.entity.Unit;
import com.quocphan.smartinventorybackend.exception.ResourceNotFoundException;
import com.quocphan.smartinventorybackend.repository.UnitRepository;
import com.quocphan.smartinventorybackend.service.UnitService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UnitServiceImpl implements UnitService {

    private final UnitRepository unitRepository;

    @Override
    @Transactional(readOnly = true)
    public List<UnitDto> getAllUnits() {
        return unitRepository.findAll().stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UnitDto getUnitById(Integer id) {
        Unit unit = unitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Unit not found with id: " + id));
        return convertToDto(unit);
    }

    @Override
    @Transactional
    public UnitDto createUnit(UnitDto unitDto) {
        Unit unit = convertToEntity(unitDto);
        Unit savedUnit = unitRepository.save(unit);
        return convertToDto(savedUnit);
    }

    @Override
    @Transactional
    public UnitDto updateUnit(Integer id, UnitDto unitDto) {
        Unit existingUnit = unitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Unit not found with id: " + id));

        existingUnit.setUnitName(unitDto.getUnitName());
        existingUnit.setDescription(unitDto.getDescription());

        Unit updatedUnit = unitRepository.save(existingUnit);
        return convertToDto(updatedUnit);
    }

    @Override
    @Transactional
    public void deleteUnit(Integer id) {
        Unit unit = unitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Unit not found with id: " + id));
        unitRepository.delete(unit);
    }

    private UnitDto convertToDto(Unit unit) {
        UnitDto dto = new UnitDto();
        dto.setId(unit.getId());
        dto.setUnitName(unit.getUnitName());
        dto.setDescription(unit.getDescription());
        return dto;
    }

    private Unit convertToEntity(UnitDto dto) {
        Unit unit = new Unit();
        unit.setUnitName(dto.getUnitName());
        unit.setDescription(dto.getDescription());
        return unit;
    }
}
