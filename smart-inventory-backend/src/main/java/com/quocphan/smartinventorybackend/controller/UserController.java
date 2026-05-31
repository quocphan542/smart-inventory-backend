package com.quocphan.smartinventorybackend.controller;

import com.quocphan.smartinventorybackend.dto.UserDto;
import com.quocphan.smartinventorybackend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
// @PreAuthorize("hasRole('ADMIN')") // XÓA DÒNG NÀY
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Integer id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<Void> toggleUserStatus(@PathVariable Integer id) {
        userService.toggleUserStatus(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/change-role")
    public ResponseEntity<Void> changeUserRole(@PathVariable Integer id, @RequestBody Map<String, Integer> payload) {
        Integer roleId = payload.get("roleId");
        userService.changeUserRole(id, roleId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Integer id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}