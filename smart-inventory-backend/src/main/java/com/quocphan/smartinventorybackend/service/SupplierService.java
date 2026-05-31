package com.quocphan.smartinventorybackend.service;

import com.quocphan.smartinventorybackend.dto.SupplierDto;
import java.util.List;

public interface SupplierService {
    List<SupplierDto> getAllSuppliers();
    SupplierDto getSupplierById(Integer id);
    SupplierDto createSupplier(SupplierDto supplierDto);
    SupplierDto updateSupplier(Integer id, SupplierDto supplierDto);
    void deleteSupplier(Integer id);
    void toggleSupplierStatus(Integer id);
}