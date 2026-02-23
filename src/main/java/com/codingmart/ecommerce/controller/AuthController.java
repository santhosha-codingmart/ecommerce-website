package com.codingmart.ecommerce.controller;

import com.codingmart.ecommerce.dto.LoginRequest;
import com.codingmart.ecommerce.dto.LoginResponse;
import com.codingmart.ecommerce.dto.SignupRequest;
import com.codingmart.ecommerce.entity.User;
import com.codingmart.ecommerce.repository.UserRepository;
import com.codingmart.ecommerce.security.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Controller handling authentication requests (Signup and Signin).
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Signup endpoint to register a new user.
     */
    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signupRequest) {

        // 1. Check if passwords match
        if (!signupRequest.getPassword().equals(signupRequest.getConfirmPassword())) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Passwords do not match!");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        // 2. Check if email is already taken
        if (userRepository.findByUserEmail(signupRequest.getEmail()).isPresent()) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Email is already in use!");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        // 3. Create new user entity and map DTO values
        User user = new User();
        user.setUserName(signupRequest.getFullName());
        user.setUserEmail(signupRequest.getEmail());

        // 4. Hash the password before saving!
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));

        // 5. Save to database
        userRepository.save(user);

        Map<String, String> response = new HashMap<>();
        response.put("message", "User registered successfully!");
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Signin endpoint to authenticate user and return a JWT.
     */
    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        // 1. Find user by email
        Optional<User> userOptional = userRepository.findByUserEmail(loginRequest.getEmail());

        // 2. If user exists and password matches
        if (userOptional.isPresent() &&
                passwordEncoder.matches(loginRequest.getPassword(), userOptional.get().getPassword())) {

            // 3. Generate token
            String jwt = jwtUtil.generateToken(userOptional.get().getUserEmail());

            return ResponseEntity.ok(new LoginResponse(jwt, "Login successful!", userOptional.get().getUser_id()));
        }

        // 4. Authentication failed
        Map<String, String> response = new HashMap<>();
        response.put("error", "Invalid email or password!");
        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }
}
