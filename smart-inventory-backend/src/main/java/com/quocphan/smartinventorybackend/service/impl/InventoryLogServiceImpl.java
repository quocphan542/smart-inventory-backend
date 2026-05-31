package com.quocphan.smartinventorybackend.service.impl;

import com.quocphan.smartinventorybackend.dto.InventoryLogDto;
import com.quocphan.smartinventorybackend.entity.InventoryLog;
import com.quocphan.smartinventorybackend.repository.InventoryLogRepository;
import com.quocphan.smartinventorybackend.repository.ProductRepository;
import com.quocphan.smartinventorybackend.service.InventoryLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryLogServiceImpl implements InventoryLogService {

    private final InventoryLogRepository logRepository;
    private final ProductRepository productRepository;

    @Override
    public List<InventoryLogDto> getRecentLogs(int limit) {
        Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
        return logRepository.findAll(pageable).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private InventoryLogDto convertToDto(InventoryLog log) {
        InventoryLogDto dto = new InventoryLogDto();
        dto.setId(log.getId());
        dto.setTransactionType(log.getTransactionType());
        dto.setQuantity(log.getQuantity());
        dto.setTransactionId(log.getTransactionId());
        dto.setCreatedAt(log.getCreatedAt());
        
        if (log.getProductId() != null) {
            dto.setProductId(log.getProductId());
            productRepository.findById(log.getProductId()).ifPresent(product -> {
                dto.setProductName(product.getProductName());
            });
        }

        // For simplicity, operator is not linked yet. This can be added later.
        // dto.setOperatorUsername("N/A"); 

        return dto;
    }
}