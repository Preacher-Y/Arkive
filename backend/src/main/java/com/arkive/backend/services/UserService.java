package com.arkive.backend.services;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.arkive.backend.DTOs.user.UserDTO;
import com.arkive.backend.DTOs.user.UserSignUpDTO;
import com.arkive.backend.model.User;
import com.arkive.backend.repository.UserRepository;

import jakarta.persistence.EntityNotFoundException;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepo;
    @Autowired
    private PasswordEncoder encoder;

    public String addNewUser(UserSignUpDTO user){
        UserDTO existingUser = userRepo.findByEmail(user.email());

        if(existingUser != null){
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

    public List<UserDTO> getAllUsers() {
        List<UserDTO> users = userRepo.findAll()
                .stream()
                .map(user -> UserDTO.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .build())
                .toList();

        if(users == null || users.isEmpty()){
            throw new EntityNotFoundException("No Users Found");
        }

        return users;
    }
        
    public UserDTO getUserByEmail(String email){
        UserDTO user = userRepo.findByEmail(email);

        if(user != null){
            return user;
        } else {
            throw new EntityNotFoundException("User Not Found");
        }
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
