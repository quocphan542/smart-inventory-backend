package com.quocphan.smartinventorybackend.service;

import com.quocphan.smartinventorybackend.dto.AiDemandForecastDto;
import java.util.List;

public interface AiDemandForecastService {
    List<AiDemandForecastDto> getAllForecasts();
    AiDemandForecastDto getForecastById(Integer id);
    List<AiDemandForecastDto> getForecastsByProductId(Integer productId);
    AiDemandForecastDto createForecast(AiDemandForecastDto forecastDto);
    AiDemandForecastDto updateForecast(Integer id, AiDemandForecastDto forecastDto);
    void deleteForecast(Integer id);
}
