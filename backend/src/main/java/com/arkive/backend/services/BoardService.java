package com.arkive.backend.services;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.arkive.backend.DTOs.board.BoardDetailsDTO;
import com.arkive.backend.DTOs.board.BoardSummaryDTO;
import com.arkive.backend.DTOs.board.CreateBoardRequestDTO;
import com.arkive.backend.DTOs.board.UpdateBoardRequestDTO;
import com.arkive.backend.DTOs.column.ColumnDTO;
import com.arkive.backend.DTOs.member.BoardMemberDTO;
import com.arkive.backend.DTOs.preference.BoardPreferenceDTO;
import com.arkive.backend.DTOs.preference.UpdateBoardBackgroundRequestDTO;
import com.arkive.backend.DTOs.task.TaskDTO;
import com.arkive.backend.model.Board;
import com.arkive.backend.model.BoardColumn;
import com.arkive.backend.model.BoardMember;
import com.arkive.backend.model.BoardMemberRole;
import com.arkive.backend.model.BoardPreference;
import com.arkive.backend.model.Task;
import com.arkive.backend.model.TaskAssignee;
import com.arkive.backend.model.User;
import com.arkive.backend.repository.BoardColumnRepository;
import com.arkive.backend.repository.BoardMemberRepository;
import com.arkive.backend.repository.BoardPreferenceRepository;
import com.arkive.backend.repository.BoardRepository;
import com.arkive.backend.repository.TaskAssigneeRepository;
import com.arkive.backend.repository.TaskRepository;
import com.arkive.backend.repository.UserRepository;
import com.arkive.backend.util.BoardDomainMapper;

import jakarta.persistence.EntityNotFoundException;

@Service
public class BoardService {

    private static final String DEFAULT_COLUMN_TODO = "To-do";
    private static final String DEFAULT_COLUMN_DOING = "Doing";
    private static final String DEFAULT_COLUMN_DONE = "Done";

    private final BoardRepository boardRepository;
    private final BoardMemberRepository boardMemberRepository;
    private final BoardPreferenceRepository boardPreferenceRepository;
    private final BoardColumnRepository boardColumnRepository;
    private final TaskRepository taskRepository;
    private final TaskAssigneeRepository taskAssigneeRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;
    private final BoardAccessService boardAccessService;
    private final BoardDomainMapper boardDomainMapper;

    public BoardService(
            BoardRepository boardRepository,
            BoardMemberRepository boardMemberRepository,
            BoardPreferenceRepository boardPreferenceRepository,
            BoardColumnRepository boardColumnRepository,
            TaskRepository taskRepository,
            TaskAssigneeRepository taskAssigneeRepository,
            UserRepository userRepository,
            CurrentUserService currentUserService,
            BoardAccessService boardAccessService,
            BoardDomainMapper boardDomainMapper) {
        this.boardRepository = boardRepository;
        this.boardMemberRepository = boardMemberRepository;
        this.boardPreferenceRepository = boardPreferenceRepository;
        this.boardColumnRepository = boardColumnRepository;
        this.taskRepository = taskRepository;
        this.taskAssigneeRepository = taskAssigneeRepository;
        this.userRepository = userRepository;
        this.currentUserService = currentUserService;
        this.boardAccessService = boardAccessService;
        this.boardDomainMapper = boardDomainMapper;
    }

    @Transactional
    public BoardDetailsDTO createBoard(CreateBoardRequestDTO request) {
        UUID currentUserId = currentUserService.getCurrentUserId();
        User owner = getUserOrThrow(currentUserId);

        String boardName = requireNonBlank(request.name(), "Board name is required");
        Board board = Board.builder()
                .name(boardName)
                .owner(owner)
                .build();
        Board persistedBoard = boardRepository.save(board);

        BoardMember ownerMembership = BoardMember.builder()
                .board(persistedBoard)
                .user(owner)
                .role(BoardMemberRole.OWNER)
                .build();
        boardMemberRepository.save(ownerMembership);

        boardColumnRepository.saveAll(List.of(
                BoardColumn.builder().board(persistedBoard).title(DEFAULT_COLUMN_TODO).position(1).build(),
                BoardColumn.builder().board(persistedBoard).title(DEFAULT_COLUMN_DOING).position(2).build(),
                BoardColumn.builder().board(persistedBoard).title(DEFAULT_COLUMN_DONE).position(3).build()));

        Board refreshedBoard = boardAccessService.getBoardOrThrow(persistedBoard.getId());
        return buildBoardDetails(refreshedBoard, currentUserId);
    }

    @Transactional(readOnly = true)
    public List<BoardSummaryDTO> getBoardsForCurrentUser() {
        UUID currentUserId = currentUserService.getCurrentUserId();
        List<Board> boards = boardRepository.findDistinctByMembersUserIdOrderByUpdatedAtDesc(currentUserId);

        return boards.stream()
                .map(board -> boardDomainMapper.toBoardSummaryDTO(
                        board,
                        boardMemberRepository.countByBoardId(board.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public BoardDetailsDTO getBoardDetails(UUID boardId) {
        UUID currentUserId = currentUserService.getCurrentUserId();
        Board board = boardAccessService.getBoardOrThrow(boardId);
        boardAccessService.assertBoardMember(boardId, currentUserId);
        return buildBoardDetails(board, currentUserId);
    }

    @Transactional
    public BoardDetailsDTO updateBoard(UUID boardId, UpdateBoardRequestDTO request) {
        UUID currentUserId = currentUserService.getCurrentUserId();
        Board board = boardAccessService.getBoardOrThrow(boardId);
        boardAccessService.assertBoardOwner(boardId, currentUserId);
        String boardName = requireNonBlank(request.name(), "Board name is required");
        board.setName(boardName);
        return buildBoardDetails(board, currentUserId);
    }

    @Transactional
    public void deleteBoard(UUID boardId) {
        UUID currentUserId = currentUserService.getCurrentUserId();
        Board board = boardAccessService.getBoardOrThrow(boardId);
        boardAccessService.assertBoardOwner(boardId, currentUserId);
        boardRepository.delete(board);
    }

    @Transactional
    public BoardMemberDTO addMember(UUID boardId, UUID userId) {
        UUID currentUserId = currentUserService.getCurrentUserId();
        Board board = boardAccessService.getBoardOrThrow(boardId);
        boardAccessService.assertBoardOwner(boardId, currentUserId);
        User user = getUserOrThrow(userId);

        if (boardMemberRepository.existsByBoardIdAndUserId(boardId, userId)) {
            throw new IllegalArgumentException("User is already a board member");
        }

        BoardMember member = BoardMember.builder()
                .board(board)
                .user(user)
                .role(BoardMemberRole.MEMBER)
                .build();

        BoardMember persistedMember = boardMemberRepository.save(member);
        return boardDomainMapper.toBoardMemberDTO(persistedMember);
    }

    @Transactional
    public void removeMember(UUID boardId, UUID userId) {
        UUID currentUserId = currentUserService.getCurrentUserId();
        Board board = boardAccessService.getBoardOrThrow(boardId);
        boardAccessService.assertBoardOwner(boardId, currentUserId);
        if (board.getOwner().getId().equals(userId)) {
            throw new IllegalArgumentException("Board owner cannot be removed");
        }

        BoardMember member = boardMemberRepository.findByBoardIdAndUserId(boardId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Board member not found"));
        boardMemberRepository.delete(member);
        boardPreferenceRepository.deleteByBoardIdAndUserId(boardId, userId);
        taskAssigneeRepository.deleteByTaskBoardIdAndUserId(boardId, userId);
    }

    @Transactional
    public BoardPreferenceDTO updateBackgroundPreference(UUID boardId, UpdateBoardBackgroundRequestDTO request) {
        UUID currentUserId = currentUserService.getCurrentUserId();
        Board board = boardAccessService.getBoardOrThrow(boardId);
        boardAccessService.assertBoardMember(boardId, currentUserId);
        User user = getUserOrThrow(currentUserId);
        String background = requireNonBlank(request.background(), "Background is required");

        BoardPreference preference = boardPreferenceRepository.findByBoardIdAndUserId(boardId, currentUserId)
                .orElseGet(() -> BoardPreference.builder()
                        .board(board)
                        .user(user)
                        .build());
        preference.setBackground(background);
        BoardPreference persistedPreference = boardPreferenceRepository.save(preference);
        return boardDomainMapper.toBoardPreferenceDTO(persistedPreference);
    }

    private BoardDetailsDTO buildBoardDetails(Board board, UUID currentUserId) {
        List<BoardMemberDTO> members = boardMemberRepository.findByBoardIdOrderByJoinedAtAsc(board.getId())
                .stream()
                .map(boardDomainMapper::toBoardMemberDTO)
                .toList();

        List<ColumnDTO> columns = boardColumnRepository.findByBoardIdOrderByPositionAsc(board.getId())
                .stream()
                .map(this::toColumnDTOWithTasks)
                .toList();

        String background = boardPreferenceRepository.findByBoardIdAndUserId(board.getId(), currentUserId)
                .map(BoardPreference::getBackground)
                .orElse(null);

        return boardDomainMapper.toBoardDetailsDTO(board, background, members, columns);
    }

    private ColumnDTO toColumnDTOWithTasks(BoardColumn column) {
        List<TaskDTO> taskDTOs = taskRepository.findByColumnIdOrderByPositionAsc(column.getId())
                .stream()
                .map(this::toTaskDTO)
                .toList();
        return boardDomainMapper.toColumnDTO(column, taskDTOs);
    }

    private TaskDTO toTaskDTO(Task task) {
        List<TaskAssignee> assignees = taskAssigneeRepository.findByTaskIdOrderByAssignedAtAsc(task.getId());
        return boardDomainMapper.toTaskDTO(task, assignees);
    }

    private User getUserOrThrow(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + userId));
    }

    private String requireNonBlank(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(message);
        }
        return value.trim();
    }
}
