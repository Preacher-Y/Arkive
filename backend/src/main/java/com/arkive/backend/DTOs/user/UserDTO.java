package com.arkive.backend.DTOs.user;

import java.util.UUID;

import lombok.Builder;
@Builder
public record UserDTO(
    UUID id,
    String name,
    String email
) {}
