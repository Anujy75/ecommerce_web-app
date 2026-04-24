package com.anuj.backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Name is required")
    private String name;

    // 🔥 EMAIL VALIDATION (MNC level)
    @NotBlank(message = "Email is required")

    @Email(message = "Please enter a valid email address")

    @Pattern(
            regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$",
            message = "Please enter a valid email address"
    )
    private String email;

    // 🔥 PASSWORD VALIDATION
    @NotBlank(message = "Password is required")

    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$%^&+=!]).{8,}$",
            message = "Password must be at least 8 characters and include uppercase, lowercase, number and special character"
    )
    private String password;

    // 🔥 PHONE VALIDATION (India format)
    @Pattern(
            regexp = "^[6-9][0-9]{9}$",
            message = "Please enter a valid 10-digit phone number"
    )
    private String phone;

    private String address;
}