package com.codingmart.ecommerce.repository;

import com.codingmart.ecommerce.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;

/**
 * Repository interface for Product entity.
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    /**
     * Finds products by category name with pagination.
     * Spring Data JPA parses this method name to create the query!
     */
    Page<Product> findByCategoryCategoryName(String categoryName, Pageable pageable);

    /**
     * Finds products by category ID with pagination.
     */
    Page<Product> findByCategoryCategoryId(Long categoryId, Pageable pageable);

    /**
     * Finds all products with pagination.
     */
    Page<Product> findAll(Pageable pageable);

    /**
     * Keyword search for products by name (case-insensitive).
     */
    Page<Product> findByProductNameContainingIgnoreCase(String productName, Pageable pageable);

    /**
     * Filter products by price range.
     */
    Page<Product> findByProductPriceBetween(BigDecimal min, BigDecimal max, Pageable pageable);
}
