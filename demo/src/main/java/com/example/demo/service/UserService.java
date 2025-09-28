package com.example.demo.service;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    // ✅ Constructor injection (better than field @Autowired)
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Save user (used during signup)
    public User saveUser(User user) {
        return userRepository.save(user);
    }

    // Get all users
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Get user by email
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found with email: " + email));
    }

    // Get user by id
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));
    }

    // Update user
    public User updateUser(Long id, User updatedUser) {
        User existingUser = getUserById(id);
        existingUser.setName(updatedUser.getName());
        existingUser.setEmail(updatedUser.getEmail());
        existingUser.setRole(updatedUser.getRole());
        existingUser.setDepartment(updatedUser.getDepartment());
        existingUser.setStaffId(updatedUser.getStaffId());
        return userRepository.save(existingUser);
    }

    // Delete user by id
    public void deleteUser(Long id) {
        User user = getUserById(id); // throws if not found
        userRepository.delete(user);
    }
}