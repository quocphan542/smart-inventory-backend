package com.quocphan.smartinventorybackend.controller;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/test-db")
public class TestDbController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostMapping("/check")
    public ResponseEntity<?> checkDatabaseWithPostmanJson(@RequestBody JsonNode requestBody) {
        Map<String, Object> response = new HashMap<>();
        try {
            // Lấy thông tin từ JSON bạn gửi lên Postman
            String usernameFromPostman = requestBody.has("username") ? requestBody.get("username").asText() : null;
            String passwordFromPostman = requestBody.has("password") ? requestBody.get("password").asText() : null;

            response.put("status", "SUCCESS");
            response.put("message", "Đã nhận được JSON từ Postman của bạn!");
            response.put("ban_da_nhap_username", usernameFromPostman);
            response.put("ban_da_nhap_password", passwordFromPostman);

            // 1. Kiểm tra dưới Database xem cái Username này có TỒN TẠI TRONG BẢNG KHÔNG
            List<Map<String, Object>> userList = jdbcTemplate.queryForList(
                    "SELECT * FROM users WHERE username = ?", usernameFromPostman);

            if (userList.isEmpty()) {
                response.put("kiem_tra_database", "❌ LỖI: Không tìm thấy tài khoản '" + usernameFromPostman + "' trong bảng users!");
            } else {
                Map<String, Object> dbUser = userList.get(0);
                String dbPassword = (String) dbUser.get("password");
                
                response.put("kiem_tra_database", "✅ Đã tìm thấy tài khoản '" + usernameFromPostman + "' trong DB!");
                response.put("mat_khau_duoi_database_hien_tai_la", dbPassword);
                
                // So sánh thẳng chuỗi mật khẩu
                if (passwordFromPostman.equals(dbPassword)) {
                    response.put("ket_qua_so_sanh", "✅ MẬT KHẨU KHỚP NHAU Y CHANG!");
                } else {
                    response.put("ket_qua_so_sanh", "❌ MẬT KHẨU KHÔNG KHỚP! Bạn gửi lên: '" + passwordFromPostman + "', nhưng dưới DB lưu là: '" + dbPassword + "'. (Nếu dưới DB là chuỗi mã hóa $2a$ thì bạn gửi pass thường sẽ bị sai)");
                }
                
                // Hiển thị toàn bộ thông tin dòng User đó lên cho bạn xem
                response.put("thong_tin_chi_tiet_user_trong_db", dbUser);
            }

            // 2. Kèm theo hiển thị luôn danh sách toàn bộ các bảng trong DB cho bạn tiện xem
            List<Map<String, Object>> tables = jdbcTemplate.queryForList(
                    "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'");
            
            Map<String, Object> allData = new HashMap<>();
            for (Map<String, Object> table : tables) {
                String tableName = (String) table.get("TABLE_NAME");
                try {
                    List<Map<String, Object>> tableData = jdbcTemplate.queryForList("SELECT * FROM " + tableName);
                    allData.put(tableName, tableData);
                } catch (Exception ex) {
                    allData.put(tableName, "Lỗi: " + ex.getMessage());
                }
            }
            response.put("toan_bo_du_lieu_cac_bang", allData);

            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("status", "FAILED");
            response.put("message", "Có lỗi xảy ra khi truy vấn Database!");
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}