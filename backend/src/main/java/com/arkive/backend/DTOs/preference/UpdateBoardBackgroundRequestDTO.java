package com.arkive.backend.DTOs.preference;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateBoardBackgroundRequestDTO(
        @NotBlank(message = "Background is required")
        @Size(max = 255, message = "Background must be at most 255 characters")
        String background) {
}
