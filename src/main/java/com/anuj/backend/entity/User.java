package com.anuj.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role = "CUSTOMER";  // ✅ Default value "CUSTOMER"

    private String phone;

    private String address;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // ✅ Automatically set createdAt before saving
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (role == null) {
            role = "CUSTOMER";
        }
    }
}