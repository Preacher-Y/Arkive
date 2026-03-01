package com.arkive.backend.DTOs.user;

import java.util.UUID;

public record UserMiniDTO(
        UUID id,
        String name) {
}
