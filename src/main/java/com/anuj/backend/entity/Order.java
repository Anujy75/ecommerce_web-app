package com.anuj.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String orderId; // Unique order number (e.g., ORD-001)

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<OrderItem> items = new ArrayList<>();

    @Column(nullable = false)
    private Double totalAmount;

    @Column(nullable = false)
    private Double shippingCharges;

    @Column(nullable = false)
    private Double taxAmount;

    @Column(nullable = false)
    private Double grandTotal;

    private String paymentMethod; // COD, CARD, UPI

    private String paymentStatus; // PENDING, PAID, FAILED

    @Column(nullable = false)
    private String orderStatus; // PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED

    // Shipping Address fields
    private String fullName;
    private String email;
    private String phone;
    private String address;
    private String city;
    private String pincode;
    // Add these fields to your Order entity
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpaySignature;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        orderStatus = "PENDING";
        paymentStatus = "PENDING";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}