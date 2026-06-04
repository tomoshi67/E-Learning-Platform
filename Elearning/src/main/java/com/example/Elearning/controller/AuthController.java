package com.example.Elearning.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import com.example.Elearning.model.User;
import com.example.Elearning.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:5177")
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public String register(@RequestBody User user) {

        User existingUser =
                userRepository.findByEmail(user.getEmail());

        if(existingUser != null) {
            return "Email already registered";
        }

        userRepository.save(user);

        return "User Registered Successfully";
    }
    @PostMapping("/login")
    public String login(@RequestBody User user) {

        User existingUser =
                userRepository.findByEmail(user.getEmail());

        if(existingUser == null) {
            return "User not found";
        }

        if(existingUser.getPassword()
                .equals(user.getPassword())) {

            return "Login Successful as "
                    + existingUser.getRole();
        }

        return "Incorrect Password";
    }

}
