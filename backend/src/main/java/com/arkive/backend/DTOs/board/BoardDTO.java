package com.arkive.backend.DTOs.board;

import java.util.UUID;

public record BoardDTO(
    UUID id,
    String name,
    int memberCount,
    UUID ownerId
) {}
