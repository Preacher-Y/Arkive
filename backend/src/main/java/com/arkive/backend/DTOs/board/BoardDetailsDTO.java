package com.arkive.backend.DTOs.board;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.arkive.backend.DTOs.column.ColumnDTO;
import com.arkive.backend.DTOs.member.BoardMemberDTO;
import com.arkive.backend.DTOs.user.UserMiniDTO;

public record BoardDetailsDTO(
        UUID id,
        String name,
        UserMiniDTO owner,
        Instant createdAt,
        Instant updatedAt,
        String currentUserBackground,
        List<BoardMemberDTO> members,
        List<ColumnDTO> columns) {
}
