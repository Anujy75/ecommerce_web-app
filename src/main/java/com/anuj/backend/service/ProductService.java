package com.anuj.backend.service;

import com.anuj.backend.entity.Product;
import com.anuj.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    // T025: Add Product
    public Product addProduct(Product product) {
        return productRepository.save(product);
    }

    // T026: Get All Products
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
}