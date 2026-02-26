package com.arkive.backend.DTOs.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;

public record UpdateUserEmailDTO(
    @NotBlank
    @Email
    String email
) {}
