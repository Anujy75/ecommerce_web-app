package com.anuj.backend.dto;

import lombok.Data;

@Data
public class CheckoutRequest {
    private String fullName;
    private String email;
    private String phone;
    private String address;
    private String city;
    private String pincode;
    private String paymentMethod; // COD, CARD, UPI
}