package com.example.english.dto;

import java.util.List;

public class AuthResponse {
    private String token;
    private String userId;
    private String email;
    private String username;
    private List<String> roles;
    private String message;

    public AuthResponse() {
    }

    public AuthResponse(String token, String userId, String email, String username, List<String> roles) {
        this.token = token;
        this.userId = userId;
        this.email = email;
        this.username = username;
        this.roles = roles;
    }

    public AuthResponse(String message) {
        this.message = message;
    }

    // Getters and Setters
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }
}
