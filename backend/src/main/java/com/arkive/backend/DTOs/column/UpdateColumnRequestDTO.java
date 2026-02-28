package com.arkive.backend.DTOs.column;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public record UpdateColumnRequestDTO(
        @Size(max = 120, message = "Column title must be at most 120 characters")
        String title,

        @Min(value = 1, message = "Position must be at least 1")
        Integer position) {
}
