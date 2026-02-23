package com.codingmart.ecommerce.entity;

import jakarta.persistence.*;
import lombok.Data;

/**
 * User Entity representing a registered customer.
 * Stores login credentials with BCrypt-hashed passwords.
 */
@Entity
@Table(name = "users")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long user_id;

    @Column(name = "user_name", nullable = false, length = 150)
    private String userName;

    @Column(name = "user_email", nullable = false, unique = true, length = 150)
    private String userEmail;

    @Column(nullable = false, length = 255)
    private String password; // Stores BCrypt hash, never plain text
}
