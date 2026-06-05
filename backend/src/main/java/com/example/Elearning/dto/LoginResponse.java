package com.example.Elearning.dto;

public class LoginResponse {

    private String token;
    private String role;
    private String message;
    private String email;

    public LoginResponse(String token, String role, String message, String email) {
        this.token = token;
        this.role = role;
        this.message = message;
        this.email = email;
    }

    public String getToken() {
        return token;
    }

    public String getRole() {
        return role;
    }

    public String getMessage() {
        return message;
    }

    public String getEmail() {
        return email;
    }
}