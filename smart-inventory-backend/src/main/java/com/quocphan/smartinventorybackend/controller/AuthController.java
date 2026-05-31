package com.quocphan.smartinventorybackend.controller;

import com.quocphan.smartinventorybackend.dto.LoginRequestDto;
import com.quocphan.smartinventorybackend.dto.LoginResponseDto;
import com.quocphan.smartinventorybackend.dto.RegisterRequestDto;
import com.quocphan.smartinventorybackend.entity.User;
import com.quocphan.smartinventorybackend.security.JwtTokenProvider;
import com.quocphan.smartinventorybackend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody RegisterRequestDto registerRequest) {
        User newUser = userService.createUser(registerRequest);
        return ResponseEntity.ok("User registered successfully with ID: " + newUser.getId());
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequestDto loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            String jwt = tokenProvider.generateToken(authentication);
            User principal = (User) authentication.getPrincipal();
            String roleName = principal.getRole() != null ? principal.getRole().getRoleName() : null;
            return ResponseEntity.ok(new LoginResponseDto(jwt, principal.getUsername(), roleName));
        } catch (BadCredentialsException e) {
            // Bắt lỗi sai mật khẩu và trả về 401
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
        } catch (Exception e) {
            // Bắt các lỗi khác và trả về 500
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An internal error occurred");
        }
    }
}