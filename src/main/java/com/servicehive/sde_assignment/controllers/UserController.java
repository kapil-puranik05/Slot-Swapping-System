package com.servicehive.sde_assignment.controllers;

import com.servicehive.sde_assignment.models.AppUser;
import com.servicehive.sde_assignment.services.UserService;
import com.servicehive.sde_assignment.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @PostMapping
    public ResponseEntity<AppUser> signup(@RequestBody AppUser user) {
        AppUser responseBody = userService.registerUser(user);
        return new ResponseEntity<>(responseBody, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AppUser loginRequest) {
        AppUser user = userService.findByEmail(loginRequest.getEmail());
        if (user == null) {
            return new ResponseEntity<>("User not found", HttpStatus.UNAUTHORIZED);
        }
        boolean passwordMatches = passwordEncoder.matches(loginRequest.getPassword(), user.getPassword());
        if (!passwordMatches) {
            return new ResponseEntity<>("Invalid credentials", HttpStatus.UNAUTHORIZED);
        }
        String token = jwtUtil.generateToken(user.getEmail());
        return ResponseEntity.ok().body(
                new LoginResponse(token, user.getId(), user.getEmail(), user.getName())
        );
    }

    record LoginResponse(String token, Long id, String email, String name) {}
}
