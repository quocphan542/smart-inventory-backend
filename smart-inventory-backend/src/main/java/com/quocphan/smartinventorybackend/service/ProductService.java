package com.quocphan.smartinventorybackend.service;

import com.quocphan.smartinventorybackend.dto.ProductDto;
import java.util.List;

public interface ProductService {
    List<ProductDto> getAllProducts();
    ProductDto getProductById(Integer id);
    ProductDto createProduct(ProductDto productDto);
    ProductDto updateProduct(Integer id, ProductDto productDto);
    void deleteProduct(Integer id);
}
