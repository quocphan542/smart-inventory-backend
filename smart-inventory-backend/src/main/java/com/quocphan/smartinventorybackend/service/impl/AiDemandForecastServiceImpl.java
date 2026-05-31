package com.quocphan.smartinventorybackend.service.impl;

import com.quocphan.smartinventorybackend.dto.AiDemandForecastDto;
import com.quocphan.smartinventorybackend.entity.AiDemandForecast;
import com.quocphan.smartinventorybackend.entity.Product;
import com.quocphan.smartinventorybackend.exception.ResourceNotFoundException;
import com.quocphan.smartinventorybackend.repository.AiDemandForecastRepository;
import com.quocphan.smartinventorybackend.repository.ProductRepository;
import com.quocphan.smartinventorybackend.service.AiDemandForecastService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AiDemandForecastServiceImpl implements AiDemandForecastService {

    private final AiDemandForecastRepository forecastRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public List<AiDemandForecastDto> getAllForecasts() {
        return forecastRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AiDemandForecastDto getForecastById(Integer id) {
        AiDemandForecast forecast = forecastRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Forecast not found with id: " + id));
        return convertToDto(forecast);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AiDemandForecastDto> getForecastsByProductId(Integer productId) {
        return forecastRepository.findByProductId(productId).stream()
                .map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AiDemandForecastDto createForecast(AiDemandForecastDto forecastDto) {
        AiDemandForecast forecast = convertToEntity(forecastDto);
        AiDemandForecast savedForecast = forecastRepository.save(forecast);
        return convertToDto(savedForecast);
    }

    @Override
    @Transactional
    public AiDemandForecastDto updateForecast(Integer id, AiDemandForecastDto forecastDto) {
        AiDemandForecast existingForecast = forecastRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Forecast not found with id: " + id));

        Product product = productRepository.findById(forecastDto.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + forecastDto.getProductId()));

        existingForecast.setProduct(product);
        existingForecast.setForecastDate(forecastDto.getForecastDate());
        existingForecast.setPredictedDemand(forecastDto.getPredictedDemand());
        existingForecast.setConfidenceInterval(forecastDto.getConfidenceInterval());

        AiDemandForecast updatedForecast = forecastRepository.save(existingForecast);
        return convertToDto(updatedForecast);
    }

    @Override
    @Transactional
    public void deleteForecast(Integer id) {
        AiDemandForecast forecast = forecastRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Forecast not found with id: " + id));
        forecastRepository.delete(forecast);
    }

    private AiDemandForecastDto convertToDto(AiDemandForecast forecast) {
        AiDemandForecastDto dto = new AiDemandForecastDto();
        dto.setId(forecast.getId());
        dto.setForecastDate(forecast.getForecastDate());
        dto.setPredictedDemand(forecast.getPredictedDemand());
        dto.setConfidenceInterval(forecast.getConfidenceInterval());
        dto.setCreatedAt(forecast.getCreatedAt());

        if (forecast.getProduct() != null) {
            dto.setProductId(forecast.getProduct().getId());
            dto.setProductName(forecast.getProduct().getProductName());
        }
        
        return dto;
    }

    private AiDemandForecast convertToEntity(AiDemandForecastDto dto) {
        AiDemandForecast forecast = new AiDemandForecast();
        
        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + dto.getProductId()));

        forecast.setProduct(product);
        forecast.setForecastDate(dto.getForecastDate());
        forecast.setPredictedDemand(dto.getPredictedDemand());
        forecast.setConfidenceInterval(dto.getConfidenceInterval());
        return forecast;
    }
}