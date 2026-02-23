package com.codingmart.ecommerce.repository;

import com.codingmart.ecommerce.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for User entity.
 * Handles all database operations for the users table.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Find a user by their email address.
     * Used during login to check credentials.
     * Returns Optional because the user may not exist.
     */
    Optional<User> findByUserEmail(String user_email);
}
