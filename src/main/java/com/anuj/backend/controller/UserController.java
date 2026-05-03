package com.anuj.backend.controller;

import com.anuj.backend.entity.User;
import com.anuj.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // ✅ GET /api/user/me - Get Current User Profile
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Password hide karo response mein
        user.setPassword(null);

        return ResponseEntity.ok(user);
    }

    // ✅ PUT /api/user/profile - Update User Profile
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody User userDetails) {
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Update only allowed fields (email cannot be changed)
        if (userDetails.getName() != null) {
            user.setName(userDetails.getName());
        }
        if (userDetails.getPhone() != null) {
            user.setPhone(userDetails.getPhone());
        }
        if (userDetails.getAddress() != null) {
            user.setAddress(userDetails.getAddress());
        }

        User updatedUser = userRepository.save(user);

        // Password hide karo response mein
        updatedUser.setPassword(null);

        return ResponseEntity.ok(updatedUser);
    }
}