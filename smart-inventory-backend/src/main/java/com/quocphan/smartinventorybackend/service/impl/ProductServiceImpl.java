package com.quocphan.smartinventorybackend.service.impl;

import com.quocphan.smartinventorybackend.dto.ProductDto;
import com.quocphan.smartinventorybackend.entity.Category;
import com.quocphan.smartinventorybackend.entity.Product;
import com.quocphan.smartinventorybackend.entity.Unit;
import com.quocphan.smartinventorybackend.exception.ResourceNotFoundException;
import com.quocphan.smartinventorybackend.repository.CategoryRepository;
import com.quocphan.smartinventorybackend.repository.ProductRepository;
import com.quocphan.smartinventorybackend.repository.UnitRepository;
import com.quocphan.smartinventorybackend.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UnitRepository unitRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ProductDto> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDto getProductById(Integer id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return convertToDto(product);
    }

    @Override
    @Transactional
    public ProductDto createProduct(ProductDto productDto) {
        productRepository.findBySku(productDto.getSku()).ifPresent(p -> {
            throw new IllegalArgumentException("SKU already exists: " + productDto.getSku());
        });

        Product product = convertToEntity(productDto);
        Product savedProduct = productRepository.save(product);
        return convertToDto(savedProduct);
    }

    @Override
    @Transactional
    public ProductDto updateProduct(Integer id, ProductDto productDto) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        productRepository.findBySku(productDto.getSku()).ifPresent(p -> {
            if (!p.getId().equals(id)) {
                throw new IllegalArgumentException("SKU already exists: " + productDto.getSku());
            }
        });

        // Update fields
        existingProduct.setSku(productDto.getSku());
        existingProduct.setProductName(productDto.getProductName());
        existingProduct.setImageUrl(productDto.getImageUrl());
        existingProduct.setMinimumStock(productDto.getMinimumStock());
        existingProduct.setBasePrice(productDto.getBasePrice());
        existingProduct.setSalePrice(productDto.getSalePrice()); // THÊM MỚI
        existingProduct.setIsActive(productDto.getIsActive());

        Category category = categoryRepository.findById(productDto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + productDto.getCategoryId()));
        existingProduct.setCategory(category);

        Unit unit = unitRepository.findById(productDto.getBaseUnitId())
                .orElseThrow(() -> new ResourceNotFoundException("Unit not found with id: " + productDto.getBaseUnitId()));
        existingProduct.setBaseUnit(unit);

        Product updatedProduct = productRepository.save(existingProduct);
        return convertToDto(updatedProduct);
    }

    @Override
    @Transactional
    public void deleteProduct(Integer id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        productRepository.delete(product);
    }

    private ProductDto convertToDto(Product product) {
        ProductDto dto = new ProductDto();
        dto.setId(product.getId());
        dto.setSku(product.getSku());
        dto.setProductName(product.getProductName());
        dto.setImageUrl(product.getImageUrl());
        dto.setMinimumStock(product.getMinimumStock());
        dto.setBasePrice(product.getBasePrice());
        dto.setSalePrice(product.getSalePrice()); // THÊM MỚI
        dto.setIsActive(product.getIsActive());
        if (product.getCategory() != null) {
            dto.setCategoryId(product.getCategory().getId());
            dto.setCategoryName(product.getCategory().getCategoryName());
        }
        if (product.getBaseUnit() != null) {
            dto.setBaseUnitId(product.getBaseUnit().getId());
            dto.setBaseUnitName(product.getBaseUnit().getUnitName());
        }
        return dto;
    }

    private Product convertToEntity(ProductDto dto) {
        Product product = new Product();
        product.setSku(dto.getSku());
        product.setProductName(dto.getProductName());
        product.setImageUrl(dto.getImageUrl());
        product.setMinimumStock(dto.getMinimumStock());
        product.setBasePrice(dto.getBasePrice());
        product.setSalePrice(dto.getSalePrice()); // THÊM MỚI
        product.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + dto.getCategoryId()));
        product.setCategory(category);

        Unit unit = unitRepository.findById(dto.getBaseUnitId())
                .orElseThrow(() -> new ResourceNotFoundException("Unit not found with id: " + dto.getBaseUnitId()));
        product.setBaseUnit(unit);

        return product;
    }
}