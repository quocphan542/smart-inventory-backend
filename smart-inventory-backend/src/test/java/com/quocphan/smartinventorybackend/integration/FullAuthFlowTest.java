package com.quocphan.smartinventorybackend.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.quocphan.smartinventorybackend.dto.LoginRequestDto;
import com.quocphan.smartinventorybackend.dto.RegisterRequestDto;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import javax.swing.*;
import java.util.concurrent.CountDownLatch;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

@SpringBootTest
@AutoConfigureMockMvc
public class FullAuthFlowTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * TEST LUỒNG HOÀN CHỈNH NHƯ THỰC TẾ TRÊN WEB FRONTEND
     * 1. Hộp thoại hỏi bạn muốn ĐĂNG KÝ hay ĐĂNG NHẬP
     * 2. Nếu chọn ĐĂNG KÝ: Yêu cầu gõ User/Pass/Role -> Hệ thống tự động mã hóa BCrypt và ném xuống Database.
     * 3. Nếu chọn ĐĂNG NHẬP: Yêu cầu gõ User/Pass -> So khớp với Database và cấp Token.
     */
    @Test
    void testFullAuthenticationFlow() throws Exception {
        System.setProperty("java.awt.headless", "false");
        CountDownLatch latch = new CountDownLatch(1);
        
        final String[] action = new String[1];
        final String[] username = new String[1];
        final String[] password = new String[1];
        final String[] role = new String[1];

        SwingUtilities.invokeLater(() -> {
            try {
                JDialog dialog = new JDialog();
                dialog.setAlwaysOnTop(true);

                // Hỏi xem muốn làm gì
                Object[] options = {"Đăng Ký", "Đăng Nhập"};
                int n = JOptionPane.showOptionDialog(dialog, "BẠN MUỐN TEST CHỨC NĂNG NÀO?", "Chọn Chức Năng",
                        JOptionPane.YES_NO_OPTION, JOptionPane.QUESTION_MESSAGE, null, options, options[1]);

                if (n == JOptionPane.CLOSED_OPTION) return; // Người dùng tắt cửa sổ

                if (n == 0) { // CHỌN ĐĂNG KÝ
                    action[0] = "REGISTER";
                    username[0] = JOptionPane.showInputDialog(dialog, "NHẬP TÊN TÀI KHOẢN MUỐN TẠO MỚI:", "Đăng Ký", JOptionPane.QUESTION_MESSAGE);
                    if (username[0] == null || username[0].trim().isEmpty()) return;

                    JPasswordField pf = new JPasswordField();
                    int ok = JOptionPane.showConfirmDialog(dialog, pf, "NHẬP MẬT KHẨU:", JOptionPane.OK_CANCEL_OPTION, JOptionPane.PLAIN_MESSAGE);
                    if (ok != JOptionPane.OK_OPTION) return;
                    password[0] = new String(pf.getPassword()).trim();

                    // Chọn Role
                    Object[] roles = {"ADMIN", "USER"};
                    int roleChoice = JOptionPane.showOptionDialog(dialog, "CHỌN QUYỀN (ROLE):", "Phân Quyền",
                            JOptionPane.YES_NO_OPTION, JOptionPane.QUESTION_MESSAGE, null, roles, roles[1]);
                    if (roleChoice == 0) role[0] = "ADMIN";
                    else if (roleChoice == 1) role[0] = "USER";
                    else return;

                } else { // CHỌN ĐĂNG NHẬP
                    action[0] = "LOGIN";
                    username[0] = JOptionPane.showInputDialog(dialog, "NHẬP TÀI KHOẢN ĐỂ ĐĂNG NHẬP:", "Đăng Nhập", JOptionPane.QUESTION_MESSAGE);
                    if (username[0] == null || username[0].trim().isEmpty()) return;

                    JPasswordField pf = new JPasswordField();
                    int ok = JOptionPane.showConfirmDialog(dialog, pf, "NHẬP MẬT KHẨU:", JOptionPane.OK_CANCEL_OPTION, JOptionPane.PLAIN_MESSAGE);
                    if (ok != JOptionPane.OK_OPTION) return;
                    password[0] = new String(pf.getPassword()).trim();
                }
            } finally {
                latch.countDown();
            }
        });

        latch.await();

        // Nếu người dùng ấn Cancel
        if (action[0] == null) {
            System.out.println("❌ BẠN ĐÃ HỦY BỎ TEST!");
            return;
        }

        JDialog resultDialog = new JDialog();
        resultDialog.setAlwaysOnTop(true);

        if ("REGISTER".equals(action[0])) {
            System.out.println("--- ĐANG GỌI API ĐĂNG KÝ XUỐNG DATABASE ---");
            RegisterRequestDto registerReq = new RegisterRequestDto();
            registerReq.setUsername(username[0]);
            registerReq.setPassword(password[0]);
            registerReq.setRoleName(role[0]);

            MvcResult result = mockMvc.perform(post("/api/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(registerReq)))
                    .andReturn();

            if (result.getResponse().getStatus() == 200) {
                System.out.println("✅ ĐĂNG KÝ THÀNH CÔNG VÀO DATABASE!");
                JOptionPane.showMessageDialog(resultDialog, "✅ ĐĂNG KÝ THÀNH CÔNG! (Hệ thống đã tự mã hóa BCrypt).\nBây giờ bạn có thể chạy lại file để Test Đăng Nhập.");
            } else {
                System.out.println("❌ ĐĂNG KÝ THẤT BẠI: " + result.getResponse().getContentAsString());
                JOptionPane.showMessageDialog(resultDialog, "❌ ĐĂNG KÝ THẤT BẠI!\n(Có thể do tài khoản đã tồn tại hoặc Role chưa có trong Database)", "Lỗi", JOptionPane.ERROR_MESSAGE);
            }
        } 
        
        else if ("LOGIN".equals(action[0])) {
            System.out.println("--- ĐANG GỌI API ĐĂNG NHẬP ĐỂ SO KHỚP VỚI DATABASE ---");
            LoginRequestDto loginReq = new LoginRequestDto();
            loginReq.setUsername(username[0]);
            loginReq.setPassword(password[0]);

            MvcResult result = mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(loginReq)))
                    .andReturn();

            int statusCode = result.getResponse().getStatus();
            if (statusCode == 200) {
                JsonNode rootNode = objectMapper.readTree(result.getResponse().getContentAsString());
                String roleName = rootNode.path("roleName").asText();
                System.out.println("✅ ĐĂNG NHẬP THÀNH CÔNG! TƯ CÁCH: " + roleName);
                JOptionPane.showMessageDialog(resultDialog, "✅ ĐĂNG NHẬP THÀNH CÔNG VỚI TƯ CÁCH LÀ: " + roleName);
            } else {
                System.out.println("❌ SAI TÀI KHOẢN HOẶC MẬT KHẨU!");
                JOptionPane.showMessageDialog(resultDialog, "❌ TÀI KHOẢN HOẶC MẬT KHẨU SAI!", "Lỗi", JOptionPane.ERROR_MESSAGE);
            }
        }
    }
}