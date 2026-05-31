package com.quocphan.smartinventorybackend.runner;

import com.quocphan.smartinventorybackend.dto.RegisterRequestDto;
import com.quocphan.smartinventorybackend.entity.Role;
import com.quocphan.smartinventorybackend.repository.RoleRepository;
import com.quocphan.smartinventorybackend.repository.UserRepository;
import com.quocphan.smartinventorybackend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    @Override
    public void run(String... args) throws Exception {
        // 1. Create Roles if they don't exist
        createRoleIfNotFound("Admin");
        createRoleIfNotFound("Thủ kho");
        createRoleIfNotFound("User");

        // 2. Create a default admin user if no users exist
        if (userRepository.count() == 0) {
            RegisterRequestDto adminRequest = new RegisterRequestDto();
            adminRequest.setUsername("admin");
            adminRequest.setPassword("123");
            
            Role adminRole = roleRepository.findByRoleNameIgnoreCase("Admin")
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy role 'Admin' trong database!"));
                    
            adminRequest.setRoleId(adminRole.getId()); 
            adminRequest.setFullName("Default Administrator");
            adminRequest.setEmail("admin@inventory.com");
            adminRequest.setPhone("000000000");
            adminRequest.setIsActive(true);

            userService.createUser(adminRequest);
        }
    }

    private void createRoleIfNotFound(String roleName) {
        if (roleRepository.findByRoleNameIgnoreCase(roleName).isEmpty()) {
            roleRepository.save(new Role(roleName));
        }
    }
}