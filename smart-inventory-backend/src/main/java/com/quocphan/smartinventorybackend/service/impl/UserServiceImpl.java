package com.quocphan.smartinventorybackend.service.impl;

import com.quocphan.smartinventorybackend.dto.RegisterRequestDto;
import com.quocphan.smartinventorybackend.dto.UserDto;
import com.quocphan.smartinventorybackend.entity.Role;
import com.quocphan.smartinventorybackend.entity.User;
import com.quocphan.smartinventorybackend.exception.ResourceNotFoundException;
import com.quocphan.smartinventorybackend.repository.InventoryAdjustmentRepository;
import com.quocphan.smartinventorybackend.repository.InventoryIssueRepository;
import com.quocphan.smartinventorybackend.repository.InventoryReceiptRepository;
import com.quocphan.smartinventorybackend.repository.RoleRepository;
import com.quocphan.smartinventorybackend.repository.UserRepository;
import com.quocphan.smartinventorybackend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final InventoryReceiptRepository receiptRepository;
    private final InventoryIssueRepository issueRepository;
    private final InventoryAdjustmentRepository adjustmentRepository;

    @Override
    @Transactional
    public User createUser(RegisterRequestDto requestDto) {
        if (userRepository.findByUsername(requestDto.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username already exists: " + requestDto.getUsername());
        }
        
        Role role = roleRepository.findById(requestDto.getRoleId())
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + requestDto.getRoleId()));
        
        User newUser = new User();
        newUser.setUsername(requestDto.getUsername());
        newUser.setPasswordHash(passwordEncoder.encode(requestDto.getPassword())); // ĐÃ SỬA LẠI
        newUser.setRole(role);
        
        newUser.setFullName(requestDto.getFullName());
        newUser.setEmail(requestDto.getEmail());
        newUser.setPhone(requestDto.getPhone());
        
        newUser.setIsActive(requestDto.getIsActive() != null ? requestDto.getIsActive() : true);

        return userRepository.save(newUser);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getUserById(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return convertToDto(user);
    }

    @Override
    @Transactional
    public void toggleUserStatus(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        user.setIsActive(!user.getIsActive());
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void changeUserRole(Integer id, Integer roleId) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + roleId));
        user.setRole(role);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void deleteUser(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        
        if (user.getRole() != null && "ADMIN".equalsIgnoreCase(user.getRole().getRoleName())) {
             throw new IllegalArgumentException("Vui lòng hạ quyền tài khoản này xuống 'Thủ kho' trước khi xóa.");
        }
        
        User adminUser = userRepository.findAll().stream()
                .filter(u -> u.getRole() != null && "ADMIN".equalsIgnoreCase(u.getRole().getRoleName()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Không tìm thấy tài khoản ADMIN nào để chuyển giao dữ liệu!"));

        receiptRepository.reassignCreatedBy(user.getId(), adminUser.getId());
        issueRepository.reassignCreatedBy(user.getId(), adminUser.getId());
        adjustmentRepository.reassignCreatedBy(user.getId(), adminUser.getId());
        
        userRepository.delete(user);
    }

    private UserDto convertToDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setIsActive(user.getIsActive());
        dto.setCreatedAt(user.getCreatedAt());
        if (user.getRole() != null) {
            dto.setRoleId(user.getRole().getId());
            dto.setRoleName(user.getRole().getRoleName());
        }
        return dto;
    }

    private User convertToEntity(UserDto dto) {
        User user = new User();
        user.setId(dto.getId()); // Cần set ID khi update
        user.setUsername(dto.getUsername());
        // Password hash không được update qua DTO này
        user.setFullName(dto.getFullName());
        user.setEmail(dto.getEmail());
        user.setPhone(dto.getPhone());
        user.setIsActive(dto.getIsActive());

        Role role = roleRepository.findById(dto.getRoleId())
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + dto.getRoleId()));
        user.setRole(role);
        
        return user;
    }
}