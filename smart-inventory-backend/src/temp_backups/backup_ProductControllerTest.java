package com.quocphan.smartinventorybackend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.quocphan.smartinventorybackend.dto.ProductDto;
import com.quocphan.smartinventorybackend.service.ProductService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
public class ProductControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ProductService productService;

    @InjectMocks
    private ProductController productController;

    private ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(productController).build();
    }

    @Test
    void getAllProducts_Success() throws Exception {
        // Arrange
        ProductDto p1 = new ProductDto();
        p1.setId(1);
        p1.setSku("SP001");
        p1.setProductName("Laptop Dell");

        ProductDto p2 = new ProductDto();
        p2.setId(2);
        p2.setSku("SP002");
        p2.setProductName("Chuột Logitech");

        List<ProductDto> mockProducts = Arrays.asList(p1, p2);

        when(productService.getAllProducts()).thenReturn(mockProducts);

        // Act & Assert
        mockMvc.perform(get("/api/products")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].productName").value("Laptop Dell"))
                .andExpect(jsonPath("$[1].id").value(2));
    }

    @Test
    void createProduct_Success() throws Exception {
        // Arrange
        ProductDto newProduct = new ProductDto();
        newProduct.setSku("SP003");
        newProduct.setProductName("Bàn phím cơ");
        newProduct.setCategoryId(1);
        newProduct.setBaseUnitId(1);

        ProductDto savedProduct = new ProductDto();
        savedProduct.setId(3);
        savedProduct.setSku("SP003");
        savedProduct.setProductName("Bàn phím cơ");

        when(productService.createProduct(any(ProductDto.class))).thenReturn(savedProduct);

        // Act & Assert
        mockMvc.perform(post("/api/products")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newProduct)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(3))
                .andExpect(jsonPath("$.productName").value("Bàn phím cơ"));
    }
}