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

    @Autowired private OrderRepository orderRepository;
    @Autowired private OrderItemRepository orderItemRepository;
    @Autowired private CartRepository cartRepository;
    @Autowired private CartItemRepository cartItemRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ProductRepository productRepository;

    @PostMapping("/checkout")
    @Transactional
    public ResponseEntity<?> checkout(@RequestBody CheckoutRequest request) {
        try {
            System.out.println("=== CHECKOUT REQUEST RECEIVED ===");
            System.out.println("Payment Method : " + request.getPaymentMethod());
            System.out.println("RazorpayPaymentId : " + request.getRazorpayPaymentId());

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

            double taxRate       = 0.18;
            double taxAmount     = totalAmount * taxRate;
            double shippingCharges = totalAmount > 500 ? 0 : 40;
            double grandTotal    = totalAmount + taxAmount + shippingCharges;

            Order order = new Order();
            order.setOrderId("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            order.setUser(user);
            order.setTotalAmount(totalAmount);
            order.setTaxAmount(taxAmount);
            order.setShippingCharges(shippingCharges);
            order.setGrandTotal(grandTotal);
            order.setPaymentMethod(request.getPaymentMethod());

            // ── Set order/payment status based on payment method ──────────────
            if ("COD".equals(request.getPaymentMethod())) {
                order.setPaymentStatus("PENDING");
                order.setOrderStatus("PENDING");
                System.out.println("COD order — PENDING");

            } else if ("RAZORPAY".equals(request.getPaymentMethod())) {
                String pid = request.getRazorpayPaymentId();
                if (pid != null && !pid.trim().isEmpty()) {
                    // Payment already verified by Razorpay — mark CONFIRMED + PAID
                    order.setPaymentStatus("PAID");
                    order.setOrderStatus("CONFIRMED");
                    order.setRazorpayPaymentId(pid);
                    System.out.println("✅ RAZORPAY — CONFIRMED + PAID. PaymentId: " + pid);
                } else {
                    order.setPaymentStatus("PENDING");
                    order.setOrderStatus("PENDING");
                    System.out.println("❌ RAZORPAY — PaymentId null, PENDING set");
                }

            } else {
                // UPI / CARD / NETBANKING — assume paid
                order.setPaymentStatus("PAID");
                order.setOrderStatus("CONFIRMED");
                System.out.println("Other method — CONFIRMED + PAID");
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
            System.out.println("Order saved — status: " + savedOrder.getOrderStatus()
                    + " | payment: " + savedOrder.getPaymentStatus());

            // Save order items & reduce stock
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

            // Clear cart
            cartItemRepository.deleteAll(cart.getItems());
            cart.getItems().clear();
            cartRepository.save(cart);

            Map<String, Object> response = new HashMap<>();
            response.put("message",       "Order placed successfully");
            response.put("orderId",        savedOrder.getOrderId());
            response.put("grandTotal",     grandTotal);
            response.put("orderStatus",    savedOrder.getOrderStatus());
            response.put("paymentStatus",  savedOrder.getPaymentStatus());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Checkout error: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // Get all orders for current user
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
                orderData.put("orderId",       order.getOrderId());
                orderData.put("grandTotal",    order.getGrandTotal());
                orderData.put("orderStatus",   order.getOrderStatus());
                orderData.put("paymentStatus", order.getPaymentStatus());
                orderData.put("createdAt",     order.getCreatedAt());
                orderData.put("itemsCount",    order.getItems().size());
                orderData.put("paymentMethod", order.getPaymentMethod());
                response.add(orderData);
            }
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // Get order by ID with full details
    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrderById(@PathVariable String orderId) {
        try {
            Order order = orderRepository.findByOrderId(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

            Map<String, Object> response = new HashMap<>();
            response.put("orderId",        order.getOrderId());
            response.put("grandTotal",     order.getGrandTotal());
            response.put("orderStatus",    order.getOrderStatus());
            response.put("paymentStatus",  order.getPaymentStatus());
            response.put("totalAmount",    order.getTotalAmount());
            response.put("taxAmount",      order.getTaxAmount());
            response.put("shippingCharges",order.getShippingCharges());
            response.put("items",          order.getItems());
            response.put("createdAt",      order.getCreatedAt());
            response.put("paymentMethod",  order.getPaymentMethod());
            if (order.getRazorpayOrderId()  != null) response.put("razorpayOrderId",  order.getRazorpayOrderId());
            if (order.getRazorpayPaymentId() != null) response.put("razorpayPaymentId", order.getRazorpayPaymentId());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // Update order status after payment verification (Razorpay)
    @PatchMapping("/{orderId}/payment-status")
    @Transactional
    public ResponseEntity<?> updatePaymentStatus(
            @PathVariable String orderId,
            @RequestBody Map<String, String> request) {
        try {
            Order order = orderRepository.findByOrderId(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

            String paymentId = request.get("paymentId");
            String status    = request.get("status");

            if ("SUCCESS".equals(status)) {
                order.setPaymentStatus("PAID");
                order.setOrderStatus("CONFIRMED");
                if (paymentId != null && !paymentId.isEmpty()) {
                    order.setRazorpayPaymentId(paymentId);
                }
            } else {
                order.setPaymentStatus("FAILED");
                order.setOrderStatus("PENDING");
            }

            orderRepository.save(order);

            return ResponseEntity.ok(Map.of(
                    "message",       "Payment status updated",
                    "orderStatus",   order.getOrderStatus(),
                    "paymentStatus", order.getPaymentStatus()
            ));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}