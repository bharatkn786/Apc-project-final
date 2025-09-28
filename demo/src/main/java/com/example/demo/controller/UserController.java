package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.service.UserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // ✅ Get all users (only for ADMIN)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")  // ROLE_ADMIN required
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }
}