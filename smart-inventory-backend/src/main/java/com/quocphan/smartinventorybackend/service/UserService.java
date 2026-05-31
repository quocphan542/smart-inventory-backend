package com.quocphan.smartinventorybackend.service;

import com.quocphan.smartinventorybackend.dto.RegisterRequestDto;
import com.quocphan.smartinventorybackend.dto.UserDto;
import com.quocphan.smartinventorybackend.entity.User;

import java.util.List;

public interface UserService {
    User createUser(RegisterRequestDto requestDto);

    List<UserDto> getAllUsers();

    UserDto getUserById(Integer id);

    void toggleUserStatus(Integer id);

    void changeUserRole(Integer id, Integer roleId);

    // THÊM HÀM XÓA
    void deleteUser(Integer id);
}