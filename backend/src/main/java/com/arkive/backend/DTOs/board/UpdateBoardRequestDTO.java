package com.arkive.backend.DTOs.board;

import jakarta.validation.constraints.Size;

public record UpdateBoardRequestDTO(
        @Size(max = 120, message = "Board name must be at most 120 characters")
        String name) {
}
