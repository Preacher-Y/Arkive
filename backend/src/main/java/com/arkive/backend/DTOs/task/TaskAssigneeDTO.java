package com.arkive.backend.DTOs.task;

import java.time.Instant;
import java.util.UUID;

import com.arkive.backend.DTOs.user.UserMiniDTO;

public record TaskAssigneeDTO(
        UUID id,
        UserMiniDTO user,
        Instant assignedAt) {
}
