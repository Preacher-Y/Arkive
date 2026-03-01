package com.arkive.backend.services;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.arkive.backend.DTOs.task.CreateTaskRequestDTO;
import com.arkive.backend.DTOs.task.MoveTaskRequestDTO;
import com.arkive.backend.DTOs.task.TaskDTO;
import com.arkive.backend.DTOs.task.UpdateTaskRequestDTO;
import com.arkive.backend.model.BoardColumn;
import com.arkive.backend.model.Task;
import com.arkive.backend.model.TaskAssignee;
import com.arkive.backend.model.User;
import com.arkive.backend.repository.BoardColumnRepository;
import com.arkive.backend.repository.BoardMemberRepository;
import com.arkive.backend.repository.TaskAssigneeRepository;
import com.arkive.backend.repository.TaskRepository;
import com.arkive.backend.repository.UserRepository;
import com.arkive.backend.util.BoardDomainMapper;

import jakarta.persistence.EntityNotFoundException;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final BoardColumnRepository boardColumnRepository;
    private final TaskAssigneeRepository taskAssigneeRepository;
    private final BoardMemberRepository boardMemberRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;
    private final BoardAccessService boardAccessService;
    private final BoardDomainMapper boardDomainMapper;

    public TaskService(
            TaskRepository taskRepository,
            BoardColumnRepository boardColumnRepository,
            TaskAssigneeRepository taskAssigneeRepository,
            BoardMemberRepository boardMemberRepository,
            UserRepository userRepository,
            CurrentUserService currentUserService,
            BoardAccessService boardAccessService,
            BoardDomainMapper boardDomainMapper) {
        this.taskRepository = taskRepository;
        this.boardColumnRepository = boardColumnRepository;
        this.taskAssigneeRepository = taskAssigneeRepository;
        this.boardMemberRepository = boardMemberRepository;
        this.userRepository = userRepository;
        this.currentUserService = currentUserService;
        this.boardAccessService = boardAccessService;
        this.boardDomainMapper = boardDomainMapper;
    }

    @Transactional
    public TaskDTO createTask(UUID columnId, CreateTaskRequestDTO request) {
        UUID currentUserId = currentUserService.getCurrentUserId();
        BoardColumn column = getColumnOrThrow(columnId);
        UUID boardId = column.getBoard().getId();
        boardAccessService.assertBoardMember(boardId, currentUserId);

        String title = requireNonBlank(request.title(), "Task title is required");
        int maxPosition = getMaxPosition(columnId);
        int requestedPosition = request.position() == null ? maxPosition + 1 : request.position();
        int newPosition = clamp(requestedPosition, 1, maxPosition + 1);

        if (newPosition <= maxPosition) {
            List<Task> tasksToShift = taskRepository.findByColumnIdAndPositionGreaterThanEqualOrderByPositionAsc(
                    columnId,
                    newPosition);
            for (Task existingTask : tasksToShift) {
                existingTask.setPosition(existingTask.getPosition() + 1);
            }
            taskRepository.saveAll(tasksToShift);
        }

        User creator = getUserOrThrow(currentUserId);
        Task task = Task.builder()
                .board(column.getBoard())
                .column(column)
                .title(title)
                .description(normalizeOptional(request.description()))
                .color(normalizeOptional(request.color()))
                .done(request.isDone() != null && request.isDone())
                .position(newPosition)
                .createdBy(creator)
                .build();

        Task persistedTask = taskRepository.save(task);
        replaceAssignees(persistedTask, boardId, request.assigneeIds());
        return toTaskDTO(persistedTask);
    }

    @Transactional
    public TaskDTO updateTask(UUID taskId, UpdateTaskRequestDTO request) {
        UUID currentUserId = currentUserService.getCurrentUserId();
        Task task = getTaskOrThrow(taskId);
        UUID boardId = task.getBoard().getId();
        boardAccessService.assertBoardMember(boardId, currentUserId);

        if (request.title() == null
                && request.description() == null
                && request.color() == null
                && request.isDone() == null
                && request.assigneeIds() == null) {
            throw new IllegalArgumentException("At least one field must be provided for update");
        }

        if (request.title() != null) {
            task.setTitle(requireNonBlank(request.title(), "Task title cannot be blank"));
        }
        if (request.description() != null) {
            task.setDescription(normalizeOptional(request.description()));
        }
        if (request.color() != null) {
            task.setColor(normalizeOptional(request.color()));
        }
        if (request.isDone() != null) {
            task.setDone(request.isDone());
        }
        if (request.assigneeIds() != null) {
            replaceAssignees(task, boardId, request.assigneeIds());
        }

        Task persistedTask = taskRepository.save(task);
        return toTaskDTO(persistedTask);
    }

    @Transactional
    public TaskDTO moveTask(UUID taskId, MoveTaskRequestDTO request) {
        UUID currentUserId = currentUserService.getCurrentUserId();
        Task task = getTaskOrThrow(taskId);
        UUID boardId = task.getBoard().getId();
        boardAccessService.assertBoardMember(boardId, currentUserId);

        BoardColumn targetColumn = getColumnOrThrow(request.targetColumnId());
        if (!targetColumn.getBoard().getId().equals(boardId)) {
            throw new IllegalArgumentException("Task can only be moved within the same board");
        }

        UUID sourceColumnId = task.getColumn().getId();
        UUID targetColumnId = targetColumn.getId();
        int sourcePosition = task.getPosition();
        int requestedTargetPosition = request.position();

        if (sourceColumnId.equals(targetColumnId)) {
            int totalTasks = Math.toIntExact(taskRepository.countByColumnId(sourceColumnId));
            int targetPosition = clamp(requestedTargetPosition, 1, totalTasks);

            if (targetPosition < sourcePosition) {
                List<Task> tasksToShift = taskRepository
                        .findByColumnIdAndPositionGreaterThanEqualAndPositionLessThanOrderByPositionAsc(
                                sourceColumnId,
                                targetPosition,
                                sourcePosition);
                for (Task existingTask : tasksToShift) {
                    existingTask.setPosition(existingTask.getPosition() + 1);
                }
                taskRepository.saveAll(tasksToShift);
                task.setPosition(targetPosition);
            } else if (targetPosition > sourcePosition) {
                List<Task> tasksToShift = taskRepository
                        .findByColumnIdAndPositionGreaterThanAndPositionLessThanEqualOrderByPositionAsc(
                                sourceColumnId,
                                sourcePosition,
                                targetPosition);
                for (Task existingTask : tasksToShift) {
                    existingTask.setPosition(existingTask.getPosition() - 1);
                }
                taskRepository.saveAll(tasksToShift);
                task.setPosition(targetPosition);
            }
        } else {
            List<Task> sourceTasksToShift = taskRepository.findByColumnIdAndPositionGreaterThanOrderByPositionAsc(
                    sourceColumnId,
                    sourcePosition);
            for (Task existingTask : sourceTasksToShift) {
                existingTask.setPosition(existingTask.getPosition() - 1);
            }
            taskRepository.saveAll(sourceTasksToShift);

            int maxTargetPosition = getMaxPosition(targetColumnId);
            int targetPosition = clamp(requestedTargetPosition, 1, maxTargetPosition + 1);

            List<Task> targetTasksToShift = taskRepository.findByColumnIdAndPositionGreaterThanEqualOrderByPositionAsc(
                    targetColumnId,
                    targetPosition);
            for (Task existingTask : targetTasksToShift) {
                existingTask.setPosition(existingTask.getPosition() + 1);
            }
            taskRepository.saveAll(targetTasksToShift);

            task.setColumn(targetColumn);
            task.setBoard(targetColumn.getBoard());
            task.setPosition(targetPosition);
        }

        Task persistedTask = taskRepository.save(task);
        return toTaskDTO(persistedTask);
    }

    @Transactional
    public void deleteTask(UUID taskId) {
        UUID currentUserId = currentUserService.getCurrentUserId();
        Task task = getTaskOrThrow(taskId);
        UUID boardId = task.getBoard().getId();
        boardAccessService.assertBoardMember(boardId, currentUserId);

        UUID columnId = task.getColumn().getId();
        int deletedPosition = task.getPosition();
        taskRepository.delete(task);

        List<Task> tasksToShift = taskRepository.findByColumnIdAndPositionGreaterThanOrderByPositionAsc(
                columnId,
                deletedPosition);
        for (Task existingTask : tasksToShift) {
            existingTask.setPosition(existingTask.getPosition() - 1);
        }
        taskRepository.saveAll(tasksToShift);
    }

    private void replaceAssignees(Task task, UUID boardId, List<UUID> assigneeIds) {
        Set<UUID> uniqueAssigneeIds = assigneeIds == null
                ? Set.of()
                : new LinkedHashSet<>(assigneeIds);

        taskAssigneeRepository.deleteByTaskId(task.getId());
        if (uniqueAssigneeIds.isEmpty()) {
            return;
        }

        List<User> assignees = userRepository.findAllById(uniqueAssigneeIds);
        if (assignees.size() != uniqueAssigneeIds.size()) {
            throw new EntityNotFoundException("One or more assignee users were not found");
        }

        for (UUID assigneeId : uniqueAssigneeIds) {
            if (!boardMemberRepository.existsByBoardIdAndUserId(boardId, assigneeId)) {
                throw new IllegalArgumentException("Assignee must be a board member: " + assigneeId);
            }
        }

        Map<UUID, User> usersById = assignees.stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));

        List<TaskAssignee> entities = new ArrayList<>();
        for (UUID assigneeId : uniqueAssigneeIds) {
            User assignee = usersById.get(assigneeId);
            entities.add(TaskAssignee.builder()
                    .task(task)
                    .user(assignee)
                    .build());
        }

        taskAssigneeRepository.saveAll(entities);
    }

    private TaskDTO toTaskDTO(Task task) {
        List<TaskAssignee> assignees = taskAssigneeRepository.findByTaskIdOrderByAssignedAtAsc(task.getId());
        return boardDomainMapper.toTaskDTO(task, assignees);
    }

    private Task getTaskOrThrow(UUID taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found: " + taskId));
    }

    private BoardColumn getColumnOrThrow(UUID columnId) {
        return boardColumnRepository.findById(columnId)
                .orElseThrow(() -> new EntityNotFoundException("Column not found: " + columnId));
    }

    private User getUserOrThrow(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + userId));
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

    private String normalizeOptional(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private int getMaxPosition(UUID columnId) {
        Task highestPositionTask = taskRepository.findFirstByColumnIdOrderByPositionDesc(columnId);
        return highestPositionTask == null ? 0 : highestPositionTask.getPosition();
    }
}
