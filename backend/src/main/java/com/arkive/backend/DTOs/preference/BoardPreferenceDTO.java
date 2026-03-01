package com.arkive.backend.DTOs.preference;

import java.time.Instant;
import java.util.UUID;

public record BoardPreferenceDTO(
        UUID boardId,
        UUID userId,
        String background,
        Instant updatedAt) {
}
