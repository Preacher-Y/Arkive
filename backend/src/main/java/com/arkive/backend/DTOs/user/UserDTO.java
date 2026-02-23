package com.arkive.backend.DTOs.user;

import java.util.UUID;

public record UserDTO(
    UUID id,
    String name,
    String email
) {}
