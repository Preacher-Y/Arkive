package com.arkive.backend.DTOs.task;

import java.util.UUID;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record MoveTaskRequestDTO(
        @NotNull(message = "Target column is required")
        UUID targetColumnId,

        @NotNull(message = "Target position is required")
        @Min(value = 1, message = "Position must be at least 1")
        Integer position) {
}
