package com.codingmart.ecommerce.service;

import com.codingmart.ecommerce.entity.Category;
import com.codingmart.ecommerce.exception.ResourceNotFoundException;
import com.codingmart.ecommerce.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service class for managing Category business logic.
 * This acts as the bridge between the Controller and the Repository.
 */
@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    /**
     * Retrieves all categories from the database (original list).
     */
    public List<Category> getAllCategoriesList() {
        return categoryRepository.findAll();
    }

    /**
     * Retrieves categories with pagination.
     */
    public Page<Category> getAllCategories(Pageable pageable) {
        return categoryRepository.findAll(pageable);
    }

    /**
     * Finds a single category by its ID.
     */
    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
    }

    /**
     * Creates a new category.
     */
    public Category createCategory(Category category) {
        return categoryRepository.save(category);
    }

    /**
     * Updates an existing category.
     */
    public Category updateCategory(Long id, Category categoryDetails) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        category.setCategoryName(categoryDetails.getCategoryName());
        // Update other fields if they exist in the future

        return categoryRepository.save(category);
    }

    /**
     * Deletes a category by its ID.
     */
    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Category not found with id: " + id);
        }
        categoryRepository.deleteById(id);
    }
}
