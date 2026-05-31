package com.quocphan.smartinventorybackend.service;

import com.quocphan.smartinventorybackend.dto.AdjustmentDto;
import com.quocphan.smartinventorybackend.dto.AdjustmentRequestDto;
import com.quocphan.smartinventorybackend.entity.InventoryAdjustment;

import java.util.List;

public interface AdjustmentService {
    InventoryAdjustment createAdjustment(AdjustmentRequestDto requestDto);
    List<AdjustmentDto> getAllAdjustments();
    void deleteAdjustment(Integer id);
}