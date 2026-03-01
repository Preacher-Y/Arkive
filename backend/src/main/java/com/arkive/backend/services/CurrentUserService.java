package com.arkive.backend.services;

import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.arkive.backend.DTOs.user.UserDTO;
import com.arkive.backend.model.User;

@Service
public class CurrentUserService {

    public UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new SecurityException("Authentication required");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDTO userDTO) {
            return userDTO.id();
        }
        if (principal instanceof User user) {
            return user.getId();
        }
        if (principal instanceof UUID uuid) {
            return uuid;
        }
        if (principal instanceof String principalString) {
            try {
                return UUID.fromString(principalString);
            } catch (IllegalArgumentException ignored) {
                throw new SecurityException("Invalid authentication principal");
            }
        }

        throw new SecurityException("Invalid authentication principal");
    }
}
