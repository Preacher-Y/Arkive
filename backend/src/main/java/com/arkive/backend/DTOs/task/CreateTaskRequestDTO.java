package com.arkive.backend.DTOs.task;

import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateTaskRequestDTO(
        @NotBlank(message = "Task title is required")
        @Size(max = 200, message = "Task title must be at most 200 characters")
        String title,

        @Size(max = 2000, message = "Task description must be at most 2000 characters")
        String description,

        @Size(max = 50, message = "Task color must be at most 50 characters")
        String color,

        Boolean isDone,

        @Min(value = 1, message = "Position must be at least 1")
        Integer position,

        List<UUID> assigneeIds) {
}
