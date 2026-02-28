package com.arkive.backend.DTOs.column;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.arkive.backend.DTOs.task.TaskDTO;

public record ColumnDTO(
        UUID id,
        String title,
        int position,
        Instant createdAt,
        Instant updatedAt,
        List<TaskDTO> tasks) {
}
