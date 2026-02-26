package com.arkive.backend.util;

import org.springframework.stereotype.Component;

import com.arkive.backend.DTOs.user.UserDTO;
import com.arkive.backend.model.User;

@Component
public class userMapper {
    public UserDTO toDto(User user) {
        return new UserDTO(
            user.getId(),
            user.getName(),
            user.getEmail()
        );
    }
}
