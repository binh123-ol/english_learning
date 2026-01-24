package com.example.english.service;

import com.example.english.dto.UserDTO;
import com.example.english.entity.User;
import com.example.english.exception.DuplicateResourceException;
import com.example.english.exception.ResourceNotFoundException;
import com.example.english.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public User createUser(UserDTO userDTO) {
        if (userRepository.existsByEmail(userDTO.getEmail())) {
            throw new DuplicateResourceException("User", "email", userDTO.getEmail());
        }

        User user = new User();
        user.setUserId(UUID.randomUUID().toString());
        user.setUsername(userDTO.getUsername());
        user.setEmail(userDTO.getEmail());
        user.setHashedPassword(passwordEncoder.encode(userDTO.getPassword()));
        user.setLevelTarget(userDTO.getLevelTarget());
        user.setCreatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    @Transactional
    public User updateUser(String id, UserDTO userDTO) {
        User user = getUserById(id);
        
        user.setUsername(userDTO.getUsername());
        if (!user.getEmail().equals(userDTO.getEmail()) && 
            userRepository.existsByEmail(userDTO.getEmail())) {
            throw new DuplicateResourceException("User", "email", userDTO.getEmail());
        }
        user.setEmail(userDTO.getEmail());
        user.setLevelTarget(userDTO.getLevelTarget());

        return userRepository.save(user);
    }

    @Transactional
    public void deleteUser(String id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User", "id", id);
        }
        userRepository.deleteById(id);
    }
}