package com.anuj.backend.controller;

import com.anuj.backend.dto.CheckoutRequest;
import com.anuj.backend.entity.*;
import com.anuj.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:3000")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @PostMapping("/checkout")
    @Transactional
    public ResponseEntity<?> checkout(@RequestBody CheckoutRequest request) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Cart cart = cartRepository.findByUser(user)
                    .orElseThrow(() -> new RuntimeException("Cart is empty"));

            if (cart.getItems().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Cart is empty"));
            }

            double totalAmount = 0.0;
            for (CartItem cartItem : cart.getItems()) {
                totalAmount += cartItem.getPrice() * cartItem.getQuantity();
            }

            double taxRate = 0.18;
            double taxAmount = totalAmount * taxRate;
            double shippingCharges = totalAmount > 500 ? 0 : 40;
            double grandTotal = totalAmount + taxAmount + shippingCharges;

            Order order = new Order();
            order.setOrderId("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            order.setUser(user);
            order.setTotalAmount(totalAmount);
            order.setTaxAmount(taxAmount);
            order.setShippingCharges(shippingCharges);
            order.setGrandTotal(grandTotal);
            order.setPaymentMethod(request.getPaymentMethod());

            // ✅ Payment method ke hisaab se initial status set karo
            if (request.getPaymentMethod().equals("COD")) {
                order.setPaymentStatus("PENDING");
                order.setOrderStatus("PENDING");
            } else if (request.getPaymentMethod().equals("RAZORPAY")) {
            // Payment ID aa gayi = payment already verified hai frontend pe
            if (request.getRazorpayPaymentId() != null
                    && !request.getRazorpayPaymentId().isEmpty()) {
                order.setPaymentStatus("PAID");
                order.setOrderStatus("CONFIRMED");
                order.setRazorpayPaymentId(request.getRazorpayPaymentId());
            } else {
                order.setPaymentStatus("PENDING");
                order.setOrderStatus("PENDING");
            }
        }


            // Store Razorpay order ID if provided
            if (request.getRazorpayOrderId() != null && !request.getRazorpayOrderId().isEmpty()) {
                order.setRazorpayOrderId(request.getRazorpayOrderId());
            }

            order.setFullName(request.getFullName());
            order.setEmail(request.getEmail());
            order.setPhone(request.getPhone());
            order.setAddress(request.getAddress());
            order.setCity(request.getCity());
            order.setPincode(request.getPincode());

            order.setCreatedAt(LocalDateTime.now());

            Order savedOrder = orderRepository.save(order);

            for (CartItem cartItem : cart.getItems()) {
                OrderItem orderItem = new OrderItem();
                orderItem.setOrder(savedOrder);
                orderItem.setProduct(cartItem.getProduct());
                orderItem.setQuantity(cartItem.getQuantity());
                orderItem.setPrice(cartItem.getPrice());
                orderItem.setTotalPrice(cartItem.getPrice() * cartItem.getQuantity());
                orderItemRepository.save(orderItem);

                Product product = cartItem.getProduct();
                product.setStock(product.getStock() - cartItem.getQuantity());
                productRepository.save(product);
            }

            cartItemRepository.deleteAll(cart.getItems());
            cart.getItems().clear();
            cartRepository.save(cart);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Order placed successfully");
            response.put("orderId", savedOrder.getOrderId());
            response.put("grandTotal", grandTotal);
            response.put("orderStatus", savedOrder.getOrderStatus());
            response.put("paymentStatus", savedOrder.getPaymentStatus());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ Get all orders for current user
    @GetMapping("/user")
    @Transactional
    public ResponseEntity<?> getUserOrders() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<Order> orders = orderRepository.findByUserOrderByCreatedAtDesc(user);

            List<Map<String, Object>> response = new ArrayList<>();
            for (Order order : orders) {
                Map<String, Object> orderData = new HashMap<>();
                orderData.put("orderId", order.getOrderId());
                orderData.put("grandTotal", order.getGrandTotal());
                orderData.put("orderStatus", order.getOrderStatus());
                orderData.put("paymentStatus", order.getPaymentStatus());
                orderData.put("createdAt", order.getCreatedAt());
                orderData.put("itemsCount", order.getItems().size());
                orderData.put("paymentMethod", order.getPaymentMethod());
                response.add(orderData);
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ Get order by ID with full details
    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrderById(@PathVariable String orderId) {
        try {
            Order order = orderRepository.findByOrderId(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

            Map<String, Object> response = new HashMap<>();
            response.put("orderId", order.getOrderId());
            response.put("grandTotal", order.getGrandTotal());
            response.put("orderStatus", order.getOrderStatus());
            response.put("paymentStatus", order.getPaymentStatus());
            response.put("totalAmount", order.getTotalAmount());
            response.put("taxAmount", order.getTaxAmount());
            response.put("shippingCharges", order.getShippingCharges());
            response.put("items", order.getItems());
            response.put("createdAt", order.getCreatedAt());
            response.put("paymentMethod", order.getPaymentMethod());
            if (order.getRazorpayOrderId() != null) {
                response.put("razorpayOrderId", order.getRazorpayOrderId());
            }
            if (order.getRazorpayPaymentId() != null) {
                response.put("razorpayPaymentId", order.getRazorpayPaymentId());
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ Update order status after payment verification (Razorpay)
    @PatchMapping("/{orderId}/payment-status")
    @Transactional
    public ResponseEntity<?> updatePaymentStatus(@PathVariable String orderId, @RequestBody Map<String, String> request) {
        try {
            System.out.println("=== PAYMENT STATUS UPDATE CALLED ===");
            System.out.println("Order ID: " + orderId);
            System.out.println("Request: " + request);

            Order order = orderRepository.findByOrderId(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

            String paymentId = request.get("paymentId");
            String status = request.get("status");

            System.out.println("Current order status: " + order.getOrderStatus());
            System.out.println("Current payment status: " + order.getPaymentStatus());

            if ("SUCCESS".equals(status)) {
                order.setPaymentStatus("PAID");
                order.setOrderStatus("CONFIRMED");
                if (paymentId != null && !paymentId.isEmpty()) {
                    order.setRazorpayPaymentId(paymentId);
                }
                System.out.println("✅ Order updated to CONFIRMED & PAID");
            } else {
                order.setPaymentStatus("FAILED");
                order.setOrderStatus("PENDING");
                System.out.println("❌ Order payment failed");
            }

            orderRepository.save(order);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Payment status updated");
            response.put("orderStatus", order.getOrderStatus());
            response.put("paymentStatus", order.getPaymentStatus());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error updating payment status: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}