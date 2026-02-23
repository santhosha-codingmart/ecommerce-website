package com.codingmart.ecommerce.exception;

/**
 * Custom exception to be thrown when a resource (Product, Category, etc.)
 * is not found in the database.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}