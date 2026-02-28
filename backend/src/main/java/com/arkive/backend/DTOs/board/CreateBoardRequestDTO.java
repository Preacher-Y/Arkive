package com.arkive.backend.DTOs.board;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateBoardRequestDTO(
        @NotBlank(message = "Board name is required")
        @Size(max = 120, message = "Board name must be at most 120 characters")
        String name) {
}
