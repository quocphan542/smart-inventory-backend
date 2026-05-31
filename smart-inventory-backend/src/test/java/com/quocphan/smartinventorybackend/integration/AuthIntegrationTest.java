package com.quocphan.smartinventorybackend.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.quocphan.smartinventorybackend.dto.LoginRequestDto;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import javax.swing.*;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

@SpringBootTest
@AutoConfigureMockMvc
public class AuthIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void testInteractiveLoginFlow_WithDialog() throws Exception {
        System.setProperty("java.awt.headless", "false");

        String inputUsername = JOptionPane.showInputDialog(null, "NHẬP TÀI KHOẢN (USERNAME):", "Test Đăng Nhập", JOptionPane.QUESTION_MESSAGE);
        
        if (inputUsername == null || inputUsername.trim().isEmpty()) {
            System.out.println("❌ BẠN CHƯA NHẬP USERNAME HOẶC ĐÃ HỦY BỎ TEST!");
            return; 
        }

        JPasswordField pf = new JPasswordField();
        int okCxl = JOptionPane.showConfirmDialog(null, pf, "NHẬP MẬT KHẨU (PASSWORD):", JOptionPane.OK_CANCEL_OPTION, JOptionPane.PLAIN_MESSAGE);
        
        if (okCxl != JOptionPane.OK_OPTION) {
            System.out.println("❌ BẠN ĐÃ HỦY BỎ NHẬP MẬT KHẨU!");
            return;
        }
        
        String inputPassword = new String(pf.getPassword()).trim();

        System.out.println("==============================================");
        System.out.println("Tài khoản đang test: " + inputUsername);
        System.out.println("Đang gửi request kiểm tra dưới Database...");
        
        // --- CHẨN ĐOÁN LỖI MẬT KHẨU ---
        System.out.println("[DEBUG] Mật khẩu bạn vừa gõ: " + inputPassword);
        System.out.println("[DEBUG] Mật khẩu này khi bị hệ thống mã hóa BCrypt sẽ trông như thế này: " + passwordEncoder.encode(inputPassword));
        System.out.println("[DEBUG] Hãy kiểm tra trong bảng Users của Database xem mật khẩu đang lưu có giống định dạng chuỗi mã hóa BCrypt ($2a$10$...) không nhé!");

        // Gắn dữ liệu vừa gõ vào DTO
        LoginRequestDto loginRequest = new LoginRequestDto();
        loginRequest.setUsername(inputUsername);
        loginRequest.setPassword(inputPassword);

        // GỌI API ĐĂNG NHẬP
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andReturn();

        int statusCode = result.getResponse().getStatus();
        String jsonResponse = result.getResponse().getContentAsString();

        System.out.println("\n----------------- KẾT QUẢ -----------------");

        // XỬ LÝ LOGIC IN KẾT QUẢ
        if (statusCode == 200) {
            JsonNode rootNode = objectMapper.readTree(jsonResponse);
            String roleName = rootNode.path("roleName").asText();

            if ("ADMIN".equalsIgnoreCase(roleName)) {
                System.out.println("✅ ĐÃ ĐĂNG NHẬP VỚI TÀI KHOẢN ADMIN");
                JOptionPane.showMessageDialog(null, "✅ ĐĂNG NHẬP THÀNH CÔNG VỚI TƯ CÁCH LÀ: ADMIN");
            } else if ("USER".equalsIgnoreCase(roleName)) {
                System.out.println("✅ ĐÃ ĐĂNG NHẬP VỚI TÀI KHOẢN USER");
                JOptionPane.showMessageDialog(null, "✅ ĐĂNG NHẬP THÀNH CÔNG VỚI TƯ CÁCH LÀ: USER");
            } else {
                System.out.println("✅ ĐÃ ĐĂNG NHẬP THÀNH CÔNG NHƯNG ROLE LÀ: " + roleName);
            }
            System.out.println("   Token được cấp: " + rootNode.path("accessToken").asText());
        } else {
            System.out.println("❌ TÀI KHOẢN HOẶC MẬT KHẨU SAI (Hoặc không tồn tại)!");
            System.out.println("   Mã lỗi HTTP: " + statusCode);
            JOptionPane.showMessageDialog(null, "❌ TÀI KHOẢN HOẶC MẬT KHẨU SAI!", "Lỗi Đăng Nhập", JOptionPane.ERROR_MESSAGE);
        }
        System.out.println("==============================================");
    }
}