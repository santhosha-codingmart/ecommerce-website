package com.codingmart.ecommerce.repository;

import com.codingmart.ecommerce.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for Category entity.
 * This handles all database operations like Find, Save, Delete.
 */
@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    // We can add custom search methods here later!
}
