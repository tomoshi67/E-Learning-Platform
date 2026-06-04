package com.example.Elearning.controller;


import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.Elearning.model.User;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
public class TestController {

    @GetMapping("/hello")
    public String hello() {
        return "Backend Working";
    }
    @PostMapping("/register")
    public String register(@RequestBody User user) {

        return "Registered " + user.getUsername();

    }

}