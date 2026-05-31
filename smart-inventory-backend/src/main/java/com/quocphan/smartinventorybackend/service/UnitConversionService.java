package com.quocphan.smartinventorybackend.service;

import com.quocphan.smartinventorybackend.dto.UnitConversionDto;
import java.util.List;

public interface UnitConversionService {
    List<UnitConversionDto> getAllConversions();
    UnitConversionDto getConversionById(Integer id);
    List<UnitConversionDto> getConversionsByProductId(Integer productId);
    UnitConversionDto createConversion(UnitConversionDto conversionDto);
    UnitConversionDto updateConversion(Integer id, UnitConversionDto conversionDto);
    void deleteConversion(Integer id);
}
