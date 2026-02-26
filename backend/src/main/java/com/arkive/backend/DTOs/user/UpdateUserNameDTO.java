package com.arkive.backend.DTOs.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateUserNameDTO(
    @NotBlank
    @Size(min=1, max=40, message="The name is must not be empty or too big")
    String name
) {}
