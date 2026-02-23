package com.codingmart.ecommerce.controller;

import com.codingmart.ecommerce.document.ProductDocument;
import com.codingmart.ecommerce.entity.Product;
import com.codingmart.ecommerce.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

/**
 * REST Controller for Product management (Discovery Flow).
 */
@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    /**
     * GET /api/products?page=0&size=10
     * Returns a paginated list of all products.
     */
    @GetMapping
    public Page<Product> getAllProducts(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return productService.getAllProducts(pageable);
    }

    /**
     * GET /api/products/category/{categoryId}?page=0&size=10
     * Returns products belonging to a specific category.
     */
    @GetMapping("/category/{categoryId}")
    public Page<Product> getProductsByCategoryId(
            @PathVariable("categoryId") Long categoryId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return productService.getProductsByCategoryId(categoryId, pageable);
    }

    /**
     * GET /api/products/search?keyword=...&page=0&size=10
     * Allows users to find products by name using Smart Search (Elasticsearch).
     */
    @GetMapping("/search")
    public Page<ProductDocument> searchProducts(
            @RequestParam(name = "q", defaultValue = "") String keyword,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return productService.searchProducts(keyword, pageable);
    }

    /**
     * GET /api/products/filter?min=0&max=1000&page=0&size=10
     * Allows users to filter products by price range.
     */
    @GetMapping("/filter")
    public Page<Product> filterProductsByPrice(
            @RequestParam("min") BigDecimal min,
            @RequestParam("max") BigDecimal max,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return productService.filterByPrice(min, max, pageable);
    }

    /**
     * POST /api/products/sync
     * Manually triggers a sync from MySQL to Elasticsearch.
     */
    @PostMapping("/sync")
    public ResponseEntity<String> syncProducts() {
        productService.syncAllProducts();
        return ResponseEntity.ok("Synchronization successful!");
    }

    /**
     * GET /api/products/{id}
     * Returns details for a single product.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable("id") Long id) {
        Product product = productService.getProductById(id);
        return ResponseEntity.ok(product);
    }
}
