package com.arkive.backend.DTOs.member;

import java.time.Instant;
import java.util.UUID;

import com.arkive.backend.DTOs.user.UserMiniDTO;

public record BoardMemberDTO(
        UUID id,
        UserMiniDTO user,
        String role,
        Instant joinedAt) {
}
