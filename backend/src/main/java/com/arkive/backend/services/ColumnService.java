package com.arkive.backend.services;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.arkive.backend.DTOs.column.ColumnDTO;
import com.arkive.backend.DTOs.column.CreateColumnRequestDTO;
import com.arkive.backend.DTOs.column.UpdateColumnRequestDTO;
import com.arkive.backend.DTOs.task.TaskDTO;
import com.arkive.backend.model.Board;
import com.arkive.backend.model.BoardColumn;
import com.arkive.backend.model.Task;
import com.arkive.backend.model.TaskAssignee;
import com.arkive.backend.repository.BoardColumnRepository;
import com.arkive.backend.repository.TaskAssigneeRepository;
import com.arkive.backend.repository.TaskRepository;
import com.arkive.backend.util.BoardDomainMapper;

import jakarta.persistence.EntityNotFoundException;

@Service
public class ColumnService {

    private final BoardColumnRepository boardColumnRepository;
    private final TaskRepository taskRepository;
    private final TaskAssigneeRepository taskAssigneeRepository;
    private final CurrentUserService currentUserService;
    private final BoardAccessService boardAccessService;
    private final BoardDomainMapper boardDomainMapper;

    public ColumnService(
            BoardColumnRepository boardColumnRepository,
            TaskRepository taskRepository,
            TaskAssigneeRepository taskAssigneeRepository,
            CurrentUserService currentUserService,
            BoardAccessService boardAccessService,
            BoardDomainMapper boardDomainMapper) {
        this.boardColumnRepository = boardColumnRepository;
        this.taskRepository = taskRepository;
        this.taskAssigneeRepository = taskAssigneeRepository;
        this.currentUserService = currentUserService;
        this.boardAccessService = boardAccessService;
        this.boardDomainMapper = boardDomainMapper;
    }

    @Transactional
    public ColumnDTO createColumn(UUID boardId, CreateColumnRequestDTO request) {
        UUID currentUserId = currentUserService.getCurrentUserId();
        boardAccessService.assertBoardMember(boardId, currentUserId);

        Board board = boardAccessService.getBoardOrThrow(boardId);
        String title = requireNonBlank(request.title(), "Column title is required");

        int maxPosition = getMaxPosition(boardId);
        int requestedPosition = request.position() == null ? maxPosition + 1 : request.position();
        int newPosition = clamp(requestedPosition, 1, maxPosition + 1);

        if (newPosition <= maxPosition) {
            List<BoardColumn> columnsToShift = boardColumnRepository
                    .findByBoardIdAndPositionGreaterThanEqualOrderByPositionAsc(boardId, newPosition);
            for (BoardColumn existingColumn : columnsToShift) {
                existingColumn.setPosition(existingColumn.getPosition() + 1);
            }
            boardColumnRepository.saveAll(columnsToShift);
        }

        BoardColumn column = BoardColumn.builder()
                .board(board)
                .title(title)
                .position(newPosition)
                .build();
        BoardColumn persistedColumn = boardColumnRepository.save(column);
        return boardDomainMapper.toColumnDTO(persistedColumn, List.of());
    }

    @Transactional
    public ColumnDTO updateColumn(UUID columnId, UpdateColumnRequestDTO request) {
        UUID currentUserId = currentUserService.getCurrentUserId();
        BoardColumn column = getColumnOrThrow(columnId);
        UUID boardId = column.getBoard().getId();
        boardAccessService.assertBoardMember(boardId, currentUserId);

        if (request.title() == null && request.position() == null) {
            throw new IllegalArgumentException("At least one field must be provided for update");
        }

        if (request.title() != null) {
            column.setTitle(requireNonBlank(request.title(), "Column title cannot be blank"));
        }

        if (request.position() != null) {
            int currentPosition = column.getPosition();
            int totalColumns = Math.toIntExact(boardColumnRepository.countByBoardId(boardId));
            int targetPosition = clamp(request.position(), 1, totalColumns);

            if (targetPosition < currentPosition) {
                List<BoardColumn> columnsToShift = boardColumnRepository
                        .findByBoardIdAndPositionGreaterThanEqualAndPositionLessThanOrderByPositionAsc(
                                boardId,
                                targetPosition,
                                currentPosition);
                for (BoardColumn existingColumn : columnsToShift) {
                    existingColumn.setPosition(existingColumn.getPosition() + 1);
                }
                boardColumnRepository.saveAll(columnsToShift);
                column.setPosition(targetPosition);
            } else if (targetPosition > currentPosition) {
                List<BoardColumn> columnsToShift = boardColumnRepository
                        .findByBoardIdAndPositionGreaterThanAndPositionLessThanEqualOrderByPositionAsc(
                                boardId,
                                currentPosition,
                                targetPosition);
                for (BoardColumn existingColumn : columnsToShift) {
                    existingColumn.setPosition(existingColumn.getPosition() - 1);
                }
                boardColumnRepository.saveAll(columnsToShift);
                column.setPosition(targetPosition);
            }
        }

        BoardColumn persistedColumn = boardColumnRepository.save(column);
        List<TaskDTO> tasks = taskRepository.findByColumnIdOrderByPositionAsc(persistedColumn.getId())
                .stream()
                .map(this::toTaskDTO)
                .toList();
        return boardDomainMapper.toColumnDTO(persistedColumn, tasks);
    }

    @Transactional
    public void deleteColumn(UUID columnId) {
        UUID currentUserId = currentUserService.getCurrentUserId();
        BoardColumn column = getColumnOrThrow(columnId);
        UUID boardId = column.getBoard().getId();
        boardAccessService.assertBoardMember(boardId, currentUserId);

        int deletedPosition = column.getPosition();
        boardColumnRepository.delete(column);
        List<BoardColumn> columnsToShift = boardColumnRepository
                .findByBoardIdAndPositionGreaterThanOrderByPositionAsc(boardId, deletedPosition);
        for (BoardColumn existingColumn : columnsToShift) {
            existingColumn.setPosition(existingColumn.getPosition() - 1);
        }
        boardColumnRepository.saveAll(columnsToShift);
    }

    private BoardColumn getColumnOrThrow(UUID columnId) {
        return boardColumnRepository.findById(columnId)
                .orElseThrow(() -> new EntityNotFoundException("Column not found: " + columnId));
    }

    private TaskDTO toTaskDTO(Task task) {
        List<TaskAssignee> assignees = taskAssigneeRepository.findByTaskIdOrderByAssignedAtAsc(task.getId());
        return boardDomainMapper.toTaskDTO(task, assignees);
    }

    private int clamp(int value, int min, int max) {
        return Math.max(min, Math.min(max, value));
    }

    private String requireNonBlank(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(message);
        }
        return value.trim();
    }

    private int getMaxPosition(UUID boardId) {
        BoardColumn highestPositionColumn = boardColumnRepository.findFirstByBoardIdOrderByPositionDesc(boardId);
        return highestPositionColumn == null ? 0 : highestPositionColumn.getPosition();
    }
}
