package com.arkive.backend.services;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.arkive.backend.model.Board;
import com.arkive.backend.model.BoardMemberRole;
import com.arkive.backend.repository.BoardMemberRepository;
import com.arkive.backend.repository.BoardRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class BoardAccessService {

    private final BoardRepository boardRepository;
    private final BoardMemberRepository boardMemberRepository;

    public BoardAccessService(BoardRepository boardRepository, BoardMemberRepository boardMemberRepository) {
        this.boardRepository = boardRepository;
        this.boardMemberRepository = boardMemberRepository;
    }

    public Board getBoardOrThrow(UUID boardId) {
        return boardRepository.findById(boardId)
                .orElseThrow(() -> new EntityNotFoundException("Board not found: " + boardId));
    }

    public void assertBoardMember(UUID boardId, UUID userId) {
        if (!boardMemberRepository.existsByBoardIdAndUserId(boardId, userId)) {
            throw new SecurityException("You are not a member of this board");
        }
    }

    public void assertBoardOwner(UUID boardId, UUID userId) {
        if (!boardMemberRepository.existsByBoardIdAndUserIdAndRole(boardId, userId, BoardMemberRole.OWNER)) {
            throw new SecurityException("Only board owner can perform this action");
        }
    }
}
