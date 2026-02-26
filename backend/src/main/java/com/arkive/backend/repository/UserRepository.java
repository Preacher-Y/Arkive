package com.arkive.backend.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.*;

import com.arkive.backend.DTOs.user.UserDTO;
import com.arkive.backend.model.User;

import java.util.List;
import java.util.Optional;



@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    List<UserDTO> findByName(String name);

}
