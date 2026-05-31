package com.quocphan.smartinventorybackend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.quocphan.smartinventorybackend.dto.WarehouseDto;
import com.quocphan.smartinventorybackend.service.WarehouseService;
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

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
public class WarehouseControllerTest {

    private MockMvc mockMvc;

    @Mock
    private WarehouseService warehouseService;

    @InjectMocks
    private WarehouseController warehouseController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(warehouseController).build();
    }

    @Test
    void getAllWarehouses_Success() throws Exception {
        // Arrange
        WarehouseDto w1 = new WarehouseDto();
        w1.setId(1);
        // Removed setWarehouseCode because WarehouseDto doesn't have a warehouseCode field
        w1.setWarehouseName("Kho Tổng Hà Nội");
        w1.setAddress("Hà Nội");
        w1.setIsActive(true);

        when(warehouseService.getAllWarehouses()).thenReturn(Arrays.asList(w1));

        // Act & Assert
        mockMvc.perform(get("/api/warehouses")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].warehouseName").value("Kho Tổng Hà Nội"));
    }
}