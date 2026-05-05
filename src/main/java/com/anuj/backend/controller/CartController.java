package com.anuj.backend.controller;

import com.anuj.backend.entity.Cart;
import com.anuj.backend.entity.CartItem;
import com.anuj.backend.entity.Product;
import com.anuj.backend.entity.User;
import com.anuj.backend.repository.CartRepository;
import com.anuj.backend.repository.CartItemRepository;
import com.anuj.backend.repository.ProductRepository;
import com.anuj.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "http://localhost:3000")
public class CartController {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    // ✅ Get current user's cart
    @GetMapping
    public ResponseEntity<?> getCart() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Cart cart = cartRepository.findByUser(user)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    return cartRepository.save(newCart);
                });

        Map<String, Object> response = new HashMap<>();
        response.put("id", cart.getId());
        response.put("items", cart.getItems());
        response.put("totalItems", cart.getTotalItems());
        response.put("totalPrice", cart.getTotalPrice());

        return ResponseEntity.ok(response);
    }

    // ✅ Add to Cart API (T035)
    @PostMapping("/add")
    public ResponseEntity<?> addToCart(@RequestBody Map<String, Object> request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Long productId = Long.valueOf(request.get("productId").toString());
        int quantity = Integer.parseInt(request.get("quantity").toString());

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Get or create cart
        Cart cart = cartRepository.findByUser(user)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    return cartRepository.save(newCart);
                });

        // Check if product already in cart
        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + quantity);
            cartItemRepository.save(item);
        } else {
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProduct(product);
            newItem.setQuantity(quantity);
            newItem.setPrice(product.getPrice());
            cart.getItems().add(newItem);
            cartItemRepository.save(newItem);
        }

        cartRepository.save(cart);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Product added to cart");
        response.put("totalItems", cart.getTotalItems());
        response.put("totalPrice", cart.getTotalPrice());

        return ResponseEntity.ok(response);
    }

    // ✅ Remove item from cart
    @DeleteMapping("/remove/{itemId}")
    public ResponseEntity<?> removeFromCart(@PathVariable Long itemId) {
        cartItemRepository.deleteById(itemId);
        return ResponseEntity.ok(Map.of("message", "Item removed from cart"));
    }

    // ✅ Update quantity
    @PutMapping("/update/{itemId}")
    public ResponseEntity<?> updateQuantity(@PathVariable Long itemId, @RequestBody Map<String, Object> request) {
        int quantity = Integer.parseInt(request.get("quantity").toString());

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        item.setQuantity(quantity);
        cartItemRepository.save(item);

        return ResponseEntity.ok(Map.of("message", "Quantity updated"));
    }

    // ✅ Clear cart
    @DeleteMapping("/clear")
    public ResponseEntity<?> clearCart() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        cartItemRepository.deleteAll(cart.getItems());
        cart.getItems().clear();
        cartRepository.save(cart);

        return ResponseEntity.ok(Map.of("message", "Cart cleared"));
    }
}