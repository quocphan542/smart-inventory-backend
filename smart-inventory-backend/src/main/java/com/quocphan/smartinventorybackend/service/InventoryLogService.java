package com.quocphan.smartinventorybackend.service;

import com.quocphan.smartinventorybackend.dto.InventoryLogDto;
import java.util.List;

public interface InventoryLogService {
    List<InventoryLogDto> getRecentLogs(int limit);
}