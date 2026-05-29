package com.anuj.backend.repository;
import java.util.Optional;
import com.anuj.backend.entity.Order;
import com.anuj.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserOrderByCreatedAtDesc(User user);
    List<Order> findByOrderStatus(String status);
    Optional<Order> findByOrderId(String orderId);
    // Add this method to OrderRepository
}