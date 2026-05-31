package com.quocphan.smartinventorybackend.service.impl;

import com.quocphan.smartinventorybackend.dto.UnitConversionDto;
import com.quocphan.smartinventorybackend.entity.Product;
import com.quocphan.smartinventorybackend.entity.Unit;
import com.quocphan.smartinventorybackend.entity.UnitConversion;
import com.quocphan.smartinventorybackend.exception.ResourceNotFoundException;
import com.quocphan.smartinventorybackend.repository.ProductRepository;
import com.quocphan.smartinventorybackend.repository.UnitConversionRepository;
import com.quocphan.smartinventorybackend.repository.UnitRepository;
import com.quocphan.smartinventorybackend.service.UnitConversionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UnitConversionServiceImpl implements UnitConversionService {

    private final UnitConversionRepository conversionRepository;
    private final ProductRepository productRepository;
    private final UnitRepository unitRepository;

    @Override
    @Transactional(readOnly = true)
    public List<UnitConversionDto> getAllConversions() {
        return conversionRepository.findAll().stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UnitConversionDto getConversionById(Integer id) {
        UnitConversion conversion = conversionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Unit Conversion not found with id: " + id));
        return convertToDto(conversion);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UnitConversionDto> getConversionsByProductId(Integer productId) {
        return conversionRepository.findByProduct_Id(productId).stream()
                .map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UnitConversionDto createConversion(UnitConversionDto conversionDto) {
        UnitConversion conversion = convertToEntity(conversionDto);
        UnitConversion savedConversion = conversionRepository.save(conversion);
        return convertToDto(savedConversion);
    }

    @Override
    @Transactional
    public UnitConversionDto updateConversion(Integer id, UnitConversionDto conversionDto) {
        UnitConversion existingConversion = conversionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Unit Conversion not found with id: " + id));

        Product product = productRepository.findById(conversionDto.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + conversionDto.getProductId()));
        Unit fromUnit = unitRepository.findById(conversionDto.getFromUnitId())
                .orElseThrow(() -> new ResourceNotFoundException("From Unit not found with id: " + conversionDto.getFromUnitId()));
        Unit toUnit = unitRepository.findById(conversionDto.getToUnitId())
                .orElseThrow(() -> new ResourceNotFoundException("To Unit not found with id: " + conversionDto.getToUnitId()));

        existingConversion.setProduct(product);
        existingConversion.setFromUnit(fromUnit);
        existingConversion.setToUnit(toUnit);
        existingConversion.setFactor(conversionDto.getFactor());

        UnitConversion updatedConversion = conversionRepository.save(existingConversion);
        return convertToDto(updatedConversion);
    }

    @Override
    @Transactional
    public void deleteConversion(Integer id) {
        UnitConversion conversion = conversionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Unit Conversion not found with id: " + id));
        conversionRepository.delete(conversion);
    }

    private UnitConversionDto convertToDto(UnitConversion conversion) {
        UnitConversionDto dto = new UnitConversionDto();
        dto.setId(conversion.getId());
        dto.setFactor(conversion.getFactor());

        if (conversion.getProduct() != null) {
            dto.setProductId(conversion.getProduct().getId());
            dto.setProductName(conversion.getProduct().getProductName());
        }
        if (conversion.getFromUnit() != null) {
            dto.setFromUnitId(conversion.getFromUnit().getId());
            dto.setFromUnitName(conversion.getFromUnit().getUnitName());
        }
        if (conversion.getToUnit() != null) {
            dto.setToUnitId(conversion.getToUnit().getId());
            dto.setToUnitName(conversion.getToUnit().getUnitName());
        }
        return dto;
    }

    private UnitConversion convertToEntity(UnitConversionDto dto) {
        UnitConversion conversion = new UnitConversion();

        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + dto.getProductId()));
        Unit fromUnit = unitRepository.findById(dto.getFromUnitId())
                .orElseThrow(() -> new ResourceNotFoundException("From Unit not found with id: " + dto.getFromUnitId()));
        Unit toUnit = unitRepository.findById(dto.getToUnitId())
                .orElseThrow(() -> new ResourceNotFoundException("To Unit not found with id: " + dto.getToUnitId()));

        conversion.setProduct(product);
        conversion.setFromUnit(fromUnit);
        conversion.setToUnit(toUnit);
        conversion.setFactor(dto.getFactor());

        return conversion;
    }
}
