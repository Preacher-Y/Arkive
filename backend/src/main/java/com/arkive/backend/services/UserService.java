package com.arkive.backend.services;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.arkive.backend.DTOs.user.UserDTO;
import com.arkive.backend.model.User;
import com.arkive.backend.repository.UserRepository;
import com.arkive.backend.util.userMapper;

import jakarta.persistence.EntityNotFoundException;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepo;
    @Autowired
    private userMapper userMapper;

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

    public UserDTO getUserById(UUID id) {
        Optional<User> user = userRepo.findById(id);

        if(user == null){
            throw new EntityNotFoundException("User Not found");
        }

        return UserDTO.builder()
                    .id(user.get().getId())
                    .name(user.get().getName())
                    .email(user.get().getEmail())
                    .build();
    }

}
