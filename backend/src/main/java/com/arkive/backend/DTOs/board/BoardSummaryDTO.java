package com.arkive.backend.DTOs.board;

import java.time.Instant;
import java.util.UUID;

import com.arkive.backend.DTOs.user.UserMiniDTO;

public record BoardSummaryDTO(
        UUID id,
        String name,
        UserMiniDTO owner,
        long memberCount,
        Instant updatedAt) {
}
