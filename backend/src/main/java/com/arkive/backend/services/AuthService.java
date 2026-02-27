package com.arkive.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.arkive.backend.DTOs.user.UserDTO;
import com.arkive.backend.DTOs.user.UserLoginDTO;
import com.arkive.backend.DTOs.user.UserSignUpDTO;
import com.arkive.backend.repository.UserRepository;
import com.arkive.backend.util.userMapper;
import com.arkive.backend.model.User;

import java.util.Optional;

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

    public String register(UserSignUpDTO user){
        Optional<User> existingUser = userRepo.findByEmail(user.email());

        if(existingUser.isPresent()){
            return "The User with that email already exist";
        } else {
            User newUser = new User();
            newUser.setName(user.name().toLowerCase());
            newUser.setEmail(user.email());
            newUser.setPassword(encoder.encode(user.password()));
            userRepo.save(newUser);
            return "Added the user Successfully";
        }
    }
}
