package com.quocphan.smartinventorybackend.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.quocphan.smartinventorybackend.dto.ProductDto;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class ProductIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    // Giả lập user đã đăng nhập có quyền ADMIN để test (bỏ qua bước lấy token)
    @Test
    @Order(1)
    @WithMockUser(username = "admin_test", roles = {"ADMIN"})
    void testCreateProduct_ToRealDatabase() throws Exception {
        // LƯU Ý: Thay đổi categoryId và baseUnitId cho phù hợp với dữ liệu thật trong bảng Categories và Units của bạn
        ProductDto newProduct = new ProductDto();
        newProduct.setSku("SKU-" + System.currentTimeMillis()); // Sinh SKU ngẫu nhiên để tránh trùng
        newProduct.setProductName("Sản phẩm Test DB Thực tế");
        newProduct.setCategoryId(1); // CẦN ĐẢM BẢO ID 1 TỒN TẠI TRONG BẢNG CATEGORIES
        newProduct.setBaseUnitId(1); // CẦN ĐẢM BẢO ID 1 TỒN TẠI TRONG BẢNG UNITS

        mockMvc.perform(post("/api/products")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newProduct)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.productName").value("Sản phẩm Test DB Thực tế"));
    }

    @Test
    @Order(2)
    @WithMockUser(username = "admin_test", roles = {"ADMIN"})
    void testGetAllProducts_FromRealDatabase() throws Exception {
        // Query toàn bộ dữ liệu từ Database SQL Server lên
        mockMvc.perform(get("/api/products")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                // Kiểm tra xem mảng trả về có dữ liệu (ít nhất là cái sản phẩm vừa thêm ở Test 1)
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").exists());
    }
}