package com.arkive.backend.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.arkive.backend.model.User;

public interface UserRepository extends JpaRepository<User, UUID> {
    
}
