package com.example.english.dto;

public class AuthResponse {
    private String token;
    private String userId;
    private String email;
    private String username;
    private String message;

    public AuthResponse() {
    }

    public AuthResponse(String token, String userId, String email, String username) {
        this.token = token;
        this.userId = userId;
        this.email = email;
        this.username = username;
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
}
