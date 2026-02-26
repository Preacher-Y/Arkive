package com.arkive.backend.services;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.arkive.backend.DTOs.user.*;
import com.arkive.backend.model.User;
import com.arkive.backend.repository.UserRepository;

import jakarta.persistence.EntityNotFoundException;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.arkive.backend.util.userMapper;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepo;
    @Autowired
    private PasswordEncoder encoder;
    @Autowired
    private userMapper userMapper;

    public String addNewUser(UserSignUpDTO user){
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

    public UserDTO login(UserLoginDTO req) {
        User user = userRepo.findByEmail(req.email())
            .orElseThrow(() -> new EntityNotFoundException("Invalid credentials"));

        if (!encoder.matches(req.password(), user.getPassword())) {
            throw new EntityNotFoundException("Invalid credentials");
        }

        return userMapper.toDto(user);
    }

    public List<UserDTO> getAllUsers() {
        List<UserDTO> users = userRepo.findAll()
                .stream()
                .map(userMapper::toDto)
                .toList();

        if(users == null || users.isEmpty()){
            throw new EntityNotFoundException("No Users Found");
        }

        return users;
    }
        
    public UserDTO getUserByEmail(String email){
        User user = userRepo.findByEmail(email)
            .orElseThrow(() -> new EntityNotFoundException("User Not Found"));
        return userMapper.toDto(user);
    }

    public List<UserDTO> getUsersByName(String name){
        List<UserDTO> users = userRepo.findByName(name);

        if(users == null ||users.isEmpty()){
            throw new EntityNotFoundException("No Users Found");
        } else {
            return users;
        }
    }

    

    @Transactional
    public void updateUserName(UUID id, String name) {
        User user = userRepo.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("User not found: " + id));

        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Name cannot be blank");
        }

        user.setName(name);
    }

    @Transactional
    public void updateUserEmail(UUID id, String email) {
        User user = userRepo.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("User not found: " + id));

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email cannot be blank");
        }

        user.setEmail(email);
    }

}
