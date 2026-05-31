package com.quocphan.smartinventorybackend.service.impl;

import com.quocphan.smartinventorybackend.dto.SupplierDto;
import com.quocphan.smartinventorybackend.entity.Supplier;
import com.quocphan.smartinventorybackend.exception.ResourceNotFoundException;
import com.quocphan.smartinventorybackend.repository.SupplierRepository;
import com.quocphan.smartinventorybackend.service.SupplierService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;

    @Override
    @Transactional(readOnly = true)
    public List<SupplierDto> getAllSuppliers() {
        return supplierRepository.findAll().stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SupplierDto getSupplierById(Integer id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));
        return convertToDto(supplier);
    }

    @Override
    @Transactional
    public SupplierDto createSupplier(SupplierDto supplierDto) {
        Supplier supplier = convertToEntity(supplierDto);
        Supplier savedSupplier = supplierRepository.save(supplier);
        return convertToDto(savedSupplier);
    }

    @Override
    @Transactional
    public SupplierDto updateSupplier(Integer id, SupplierDto supplierDto) {
        Supplier existingSupplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));

        existingSupplier.setSupplierName(supplierDto.getSupplierName());
        existingSupplier.setTaxCode(supplierDto.getTaxCode());
        existingSupplier.setPhone(supplierDto.getPhone());
        existingSupplier.setEmail(supplierDto.getEmail());
        existingSupplier.setAddress(supplierDto.getAddress());
        existingSupplier.setLeadTimeDays(supplierDto.getLeadTimeDays());
        existingSupplier.setReliabilityScore(supplierDto.getReliabilityScore());
        
        if(supplierDto.getIsActive() != null) {
            existingSupplier.setIsActive(supplierDto.getIsActive());
        }

        Supplier updatedSupplier = supplierRepository.save(existingSupplier);
        return convertToDto(updatedSupplier);
    }

    @Override
    @Transactional
    public void deleteSupplier(Integer id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));
        supplierRepository.delete(supplier);
    }

    @Override
    @Transactional
    public void toggleSupplierStatus(Integer id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));
        
        // Sửa lỗi NullPointerException khi is_active trong DB đang bị NULL
        if (supplier.getIsActive() == null) {
            supplier.setIsActive(false); // Nếu đang NULL, bấm nút tắt thì nó thành false
        } else {
            supplier.setIsActive(!supplier.getIsActive());
        }

        supplierRepository.save(supplier);
    }

    private SupplierDto convertToDto(Supplier supplier) {
        SupplierDto dto = new SupplierDto();
        dto.setId(supplier.getId());
        dto.setSupplierName(supplier.getSupplierName());
        dto.setTaxCode(supplier.getTaxCode());
        dto.setPhone(supplier.getPhone());
        dto.setEmail(supplier.getEmail());
        dto.setAddress(supplier.getAddress());
        dto.setLeadTimeDays(supplier.getLeadTimeDays());
        dto.setReliabilityScore(supplier.getReliabilityScore());
        dto.setIsActive(supplier.getIsActive());
        return dto;
    }

    private Supplier convertToEntity(SupplierDto dto) {
        Supplier supplier = new Supplier();
        supplier.setSupplierName(dto.getSupplierName());
        supplier.setTaxCode(dto.getTaxCode());
        supplier.setPhone(dto.getPhone());
        supplier.setEmail(dto.getEmail());
        supplier.setAddress(dto.getAddress());
        supplier.setLeadTimeDays(dto.getLeadTimeDays() != null ? dto.getLeadTimeDays() : 0);
        supplier.setReliabilityScore(dto.getReliabilityScore() != null ? dto.getReliabilityScore() : java.math.BigDecimal.ZERO);
        supplier.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        return supplier;
    }
}