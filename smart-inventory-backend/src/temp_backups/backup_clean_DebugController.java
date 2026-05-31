package com.quocphan.smartinventorybackend.controller;

import com.quocphan.smartinventorybackend.dto.RegisterRequestDto;
import com.quocphan.smartinventorybackend.entity.Role;
import com.quocphan.smartinventorybackend.entity.User;
import com.quocphan.smartinventorybackend.repository.RoleRepository;
import com.quocphan.smartinventorybackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/debug")
public class DebugController {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RoleRepository roleRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/check-login")
    public ResponseEntity<?> checkLogin(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        String plainPassword = payload.get("password");
        Map<String, Object> response = new HashMap<>();

        response.put("B1_TIM_USER", "Đang tìm user '" + username + "' trong database...");
        Optional<User> userOpt = userRepository.findByUsername(username);

        if (userOpt.isEmpty()) {
            response.put("KET_QUA", "❌ LỖI: Không tìm thấy tài khoản '" + username + "' trong bảng 'users'.");
            return ResponseEntity.status(404).body(response);
        }

        User user = userOpt.get();
        response.put("B2_TIM_USER_THANH_CONG", "✅ Đã tìm thấy user. ID = " + user.getId());
        
        String storedHashedPassword = user.getPassword();
        response.put("B3_LAY_MAT_KHAU_DB", "Mật khẩu đã mã hóa đang lưu trong DB là: '" + storedHashedPassword + "'");

        response.put("B4_SO_SANH", "Đang dùng BCrypt để so sánh mật khẩu bạn gõ '" + plainPassword + "' với mật khẩu trong DB...");
        boolean matches = passwordEncoder.matches(plainPassword, storedHashedPassword);

        if (matches) {
            response.put("KET_QUA_CUOI_CUNG", "✅ KHỚP! Lẽ ra bạn phải đăng nhập được. Nếu vẫn lỗi, có thể do vấn đề về Role hoặc tài khoản bị khóa (is_active=false).");
            response.put("role_cua_user_nay_la", user.getRole() != null ? user.getRole().getRoleName() : "NULL");
            response.put("trang_thai_user_nay_la_active", user.getIsActive());
        } else {
            response.put("KET_QUA_CUOI_CUNG", "❌ KHÔNG KHỚP! Mật khẩu bạn gõ không trùng với mật khẩu trong DB sau khi mã hóa. Đây là lý do đăng nhập thất bại.");
        }

        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/check-authorities")
    public ResponseEntity<?> checkAuthorities(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        Map<String, Object> response = new HashMap<>();

        Optional<User> userOpt = userRepository.findByUsername(username);

        if (userOpt.isEmpty()) {
            response.put("ERROR", "Không tìm thấy user: " + username);
            return ResponseEntity.status(404).body(response);
        }

        User user = userOpt.get();
        response.put("1_USERNAME_FROM_DB", user.getUsername());
        
        if (user.getRole() != null) {
            response.put("2_ROLENAME_FROM_DB", user.getRole().getRoleName());
        } else {
            response.put("2_ROLENAME_FROM_DB", "NULL - Đây là nguyên nhân lỗi!");
        }
        
        Collection<? extends GrantedAuthority> authorities = user.getAuthorities();
        response.put("3_AUTHORITIES_CREATED", authorities.stream().map(GrantedAuthority::getAuthority).collect(Collectors.toList()));

        return ResponseEntity.ok(response);
    }

    @PostMapping("/force-register-batch")
    @Transactional
    public ResponseEntity<?> forceRegisterBatch(@RequestBody List<RegisterRequestDto> requests) {
        List<String> results = new ArrayList<>();
        
        for (RegisterRequestDto request : requests) {
            String username = request.getUsername();
            String password = request.getPassword();
            Integer roleId = request.getRoleId();

            Role role = roleRepository.findById(roleId)
                    .orElse(null);

            if (role == null) {
                results.add("❌ LỖI với user '" + username + "': Không tìm thấy roleId " + roleId);
                continue;
            }

            User user = userRepository.findByUsername(username).orElse(new User());
            user.setUsername(username);
            user.setPasswordHash(passwordEncoder.encode(password));
            user.setRole(role);
            user.setFullName(request.getFullName());
            user.setEmail(request.getEmail());
            user.setPhone(request.getPhone());
            user.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

            userRepository.save(user);
            results.add("✅ THÀNH CÔNG: Đã tạo/cập nhật user '" + username + "'.");
        }

        return ResponseEntity.ok(results);
    }

    @PostMapping("/force-reset-admin")
    @Transactional
    public ResponseEntity<String> forceResetAdmin() {
        User admin = userRepository.findByUsername("admin")
                .orElseThrow(() -> new RuntimeException("Tài khoản 'admin' không tồn tại để reset."));
        
        admin.setPasswordHash(passwordEncoder.encode("admin123"));
        userRepository.save(admin);
        
        return ResponseEntity.ok("✅ Đã reset mật khẩu tài khoản 'admin' thành 'admin123' và mã hóa lại.");
    }
}