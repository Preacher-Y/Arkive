package com.arkive.backend.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.arkive.backend.DTOs.board.BoardDetailsDTO;
import com.arkive.backend.DTOs.board.BoardSummaryDTO;
import com.arkive.backend.DTOs.board.CreateBoardRequestDTO;
import com.arkive.backend.DTOs.board.UpdateBoardRequestDTO;
import com.arkive.backend.DTOs.member.BoardMemberDTO;
import com.arkive.backend.DTOs.preference.BoardPreferenceDTO;
import com.arkive.backend.DTOs.preference.UpdateBoardBackgroundRequestDTO;
import com.arkive.backend.services.BoardService;

import jakarta.validation.Valid;

@RestController
@Validated
@RequestMapping("/api/boards")
public class BoardController {

    private final BoardService boardService;

    public BoardController(BoardService boardService) {
        this.boardService = boardService;
    }

    @PostMapping
    public ResponseEntity<BoardDetailsDTO> createBoard(@Valid @RequestBody CreateBoardRequestDTO request) {
        BoardDetailsDTO response = boardService.createBoard(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public List<BoardSummaryDTO> getBoards() {
        return boardService.getBoardsForCurrentUser();
    }

    @GetMapping("/{boardId}")
    public BoardDetailsDTO getBoard(@PathVariable UUID boardId) {
        return boardService.getBoardDetails(boardId);
    }

    @PatchMapping("/{boardId}")
    public BoardDetailsDTO updateBoard(
            @PathVariable UUID boardId,
            @Valid @RequestBody UpdateBoardRequestDTO request) {
        return boardService.updateBoard(boardId, request);
    }

    @DeleteMapping("/{boardId}")
    public ResponseEntity<Void> deleteBoard(@PathVariable UUID boardId) {
        boardService.deleteBoard(boardId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{boardId}/members/{userId}")
    public ResponseEntity<BoardMemberDTO> addMember(
            @PathVariable UUID boardId,
            @PathVariable UUID userId) {
        BoardMemberDTO response = boardService.addMember(boardId, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{boardId}/members/{userId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable UUID boardId,
            @PathVariable UUID userId) {
        boardService.removeMember(boardId, userId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{boardId}/preferences/background")
    public BoardPreferenceDTO updateBackgroundPreference(
            @PathVariable UUID boardId,
            @Valid @RequestBody UpdateBoardBackgroundRequestDTO request) {
        return boardService.updateBackgroundPreference(boardId, request);
    }
}
