package com.quocphan.smartinventorybackend.service;

import com.quocphan.smartinventorybackend.dto.ReceiptRequestDto;
import com.quocphan.smartinventorybackend.entity.InventoryReceipt;

public interface ReceiptService {
    InventoryReceipt createReceipt(ReceiptRequestDto requestDto);
}