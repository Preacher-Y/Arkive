package com.arkive.backend.util;

import java.util.List;

import org.springframework.stereotype.Component;

import com.arkive.backend.DTOs.board.BoardDetailsDTO;
import com.arkive.backend.DTOs.board.BoardSummaryDTO;
import com.arkive.backend.DTOs.column.ColumnDTO;
import com.arkive.backend.DTOs.member.BoardMemberDTO;
import com.arkive.backend.DTOs.preference.BoardPreferenceDTO;
import com.arkive.backend.DTOs.task.TaskAssigneeDTO;
import com.arkive.backend.DTOs.task.TaskDTO;
import com.arkive.backend.DTOs.user.UserMiniDTO;
import com.arkive.backend.model.Board;
import com.arkive.backend.model.BoardColumn;
import com.arkive.backend.model.BoardMember;
import com.arkive.backend.model.BoardPreference;
import com.arkive.backend.model.Task;
import com.arkive.backend.model.TaskAssignee;
import com.arkive.backend.model.User;

@Component
public class BoardDomainMapper {

    public UserMiniDTO toUserMiniDTO(User user) {
        return new UserMiniDTO(user.getId(), user.getName());
    }

    public BoardMemberDTO toBoardMemberDTO(BoardMember member) {
        return new BoardMemberDTO(
                member.getId(),
                toUserMiniDTO(member.getUser()),
                member.getRole().name(),
                member.getJoinedAt());
    }

    public TaskAssigneeDTO toTaskAssigneeDTO(TaskAssignee assignee) {
        return new TaskAssigneeDTO(
                assignee.getId(),
                toUserMiniDTO(assignee.getUser()),
                assignee.getAssignedAt());
    }

    public TaskDTO toTaskDTO(Task task, List<TaskAssignee> assignees) {
        return new TaskDTO(
                task.getId(),
                task.getColumn().getId(),
                task.getTitle(),
                task.getDescription(),
                task.getColor(),
                task.isDone(),
                task.getPosition(),
                toUserMiniDTO(task.getCreatedBy()),
                task.getCreatedAt(),
                task.getUpdatedAt(),
                assignees.stream().map(this::toTaskAssigneeDTO).toList());
    }

    public ColumnDTO toColumnDTO(BoardColumn column, List<TaskDTO> tasks) {
        return new ColumnDTO(
                column.getId(),
                column.getTitle(),
                column.getPosition(),
                column.getCreatedAt(),
                column.getUpdatedAt(),
                tasks);
    }

    public BoardSummaryDTO toBoardSummaryDTO(Board board, long memberCount) {
        return new BoardSummaryDTO(
                board.getId(),
                board.getName(),
                toUserMiniDTO(board.getOwner()),
                memberCount,
                board.getUpdatedAt());
    }

    public BoardDetailsDTO toBoardDetailsDTO(
            Board board,
            String currentUserBackground,
            List<BoardMemberDTO> members,
            List<ColumnDTO> columns) {
        return new BoardDetailsDTO(
                board.getId(),
                board.getName(),
                toUserMiniDTO(board.getOwner()),
                board.getCreatedAt(),
                board.getUpdatedAt(),
                currentUserBackground,
                members,
                columns);
    }

    public BoardPreferenceDTO toBoardPreferenceDTO(BoardPreference preference) {
        return new BoardPreferenceDTO(
                preference.getBoard().getId(),
                preference.getUser().getId(),
                preference.getBackground(),
                preference.getUpdatedAt());
    }
}
