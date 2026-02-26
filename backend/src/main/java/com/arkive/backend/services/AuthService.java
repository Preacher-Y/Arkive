package com.arkive.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.arkive.backend.DTOs.user.UserDTO;
import com.arkive.backend.DTOs.user.UserLoginDTO;
import com.arkive.backend.repository.UserRepository;
import com.arkive.backend.util.userMapper;
import com.arkive.backend.model.User;

import jakarta.persistence.EntityNotFoundException;

@Service
public class AuthService {
    @Autowired
    private UserRepository userRepo;
    @Autowired
    private PasswordEncoder encoder;
    @Autowired
    private userMapper userMapper;


    public UserDTO login(UserLoginDTO req) {
        User user = userRepo.findByEmail(req.email())
            .orElseThrow(() -> new EntityNotFoundException("Invalid credentials"));

        if (!encoder.matches(req.password(), user.getPassword())) {
            throw new EntityNotFoundException("Invalid credentials");
        }

        return userMapper.toDto(user);
    }
}
