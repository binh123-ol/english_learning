package com.example.english.service;

import com.example.english.dto.AuthResponse;
import com.example.english.dto.LoginRequest;
import com.example.english.dto.RegisterRequest;
import com.example.english.entity.User;
import com.example.english.exception.DuplicateResourceException;
import com.example.english.exception.ResourceNotFoundException;
import com.example.english.repository.UserRepository;
import com.example.english.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsService userDetailsService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("User", "email", request.getEmail());
        }

        // Create new user
        User user = new User();
        user.setUserId(UUID.randomUUID().toString());
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setHashedPassword(passwordEncoder.encode(request.getPassword()));
        user.setLevelTarget(request.getLevelTarget());
        user.setCreatedAt(LocalDateTime.now());

        userRepository.save(user);

        // Generate JWT token
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails);

        return new AuthResponse(token, user.getUserId(), user.getEmail(), user.getUsername());
    }

    public AuthResponse login(LoginRequest request) {
        // Authenticate user
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        // Load user details
        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        // Generate JWT token
        String token = jwtUtil.generateToken(userDetails);

        return new AuthResponse(token, user.getUserId(), user.getEmail(), user.getUsername());
    }
}
