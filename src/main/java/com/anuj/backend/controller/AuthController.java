package com.anuj.backend.controller;

import com.anuj.backend.config.JwtUtil;
import com.anuj.backend.entity.User;
import com.anuj.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    // ✅ Register
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists");
        }

        // ✅ Set createdAt
        user.setCreatedAt(LocalDateTime.now());

        // ✅ Role already has default "CUSTOMER" in entity, so no need to set manually

        // ✅ Encode password
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        userRepository.save(user);
        return ResponseEntity.ok("User registered successfully");
    }

    // ✅ Login — JWT token return karega
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        Optional<User> existing = userRepository.findByEmail(user.getEmail());

        if (existing.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }

        if (!passwordEncoder.matches(user.getPassword(), existing.get().getPassword())) {
            return ResponseEntity.badRequest().body("Invalid password");
        }

        String token = jwtUtil.generateToken(existing.get().getEmail());
        return ResponseEntity.ok(Map.of("token", token));
    }
}