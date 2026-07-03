package com.example.Elearning.controller;

import com.example.Elearning.Role;
import com.example.Elearning.dto.LoginResponse;
import com.example.Elearning.model.AdminRequest;
import com.example.Elearning.model.User;
import com.example.Elearning.repository.AdminRequestRepository;
import com.example.Elearning.repository.UserRepository;
import com.example.Elearning.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final AdminRequestRepository adminRequestRepository;

    public AuthController(
            UserRepository userRepository,
            BCryptPasswordEncoder passwordEncoder,
            JwtUtil jwtUtil,
            AuthenticationManager authenticationManager,
            AdminRequestRepository adminRequestRepository
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
        this.adminRequestRepository = adminRequestRepository;
    }

    @PostMapping("/register")
    public String register(@RequestBody User user) {

        User existingUser = userRepository.findByEmail(user.getEmail());

        if (user.getUsername() == null || user.getUsername().isBlank()) {
            return "Username is required";
        }

        if (user.getEmail() == null ||
                !user.getEmail().matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            return "Enter a valid email address";
        }

        if (user.getPassword() == null || user.getPassword().length() < 6) {
            return "Password must be at least 6 characters";
        }

        if (user.getRole() == null) {
            return "Role is required";
        }

        if (existingUser != null) {
            return "Email already registered";
        }

        if (user.getRole() == Role.ADMIN) {
            if (adminRequestRepository.findByEmail(user.getEmail()).isPresent()) {
                return "Admin request already submitted";
            }

            AdminRequest request = new AdminRequest();
            request.setUsername(user.getUsername());
            request.setEmail(user.getEmail());
            request.setPassword(user.getPassword());
            request.setStatus("PENDING");

            adminRequestRepository.save(request);

            return "Admin signup request sent successfully";
        }

        String hashedPassword = passwordEncoder.encode(user.getPassword());

        user.setPassword(hashedPassword);

        userRepository.save(user);

        return "User Registered Successfully";
    }

    @PostMapping("/login")
    public Object login(@RequestBody User user) {

        User existingUser = userRepository.findByEmail(user.getEmail());

        if (user.getEmail() == null || !user.getEmail().contains("@")) {
            return "Enter a valid email";
        }

        if (user.getPassword() == null || user.getPassword().isBlank()) {
            return "Password is required";
        }

        if (existingUser == null) {
            return "User not found";
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        user.getEmail(),
                        user.getPassword()
                )
        );

        String token = jwtUtil.generateToken(existingUser);

        return new LoginResponse(
                token,
                existingUser.getRole().name(),
                "Login Successful",
                existingUser.getEmail()
        );
    }
}