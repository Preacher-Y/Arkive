package com.arkive.backend.DTOs.task;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.arkive.backend.DTOs.user.UserMiniDTO;

public record TaskDTO(
        UUID id,
        UUID columnId,
        String title,
        String description,
        String color,
        boolean isDone,
        int position,
        UserMiniDTO createdBy,
        Instant createdAt,
        Instant updatedAt,
        List<TaskAssigneeDTO> assignees) {
}
