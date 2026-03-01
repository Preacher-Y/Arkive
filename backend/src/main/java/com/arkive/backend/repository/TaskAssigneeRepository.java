package com.arkive.backend.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.arkive.backend.model.TaskAssignee;

@Repository
public interface TaskAssigneeRepository extends JpaRepository<TaskAssignee, UUID> {

    List<TaskAssignee> findByTaskIdOrderByAssignedAtAsc(UUID taskId);

    void deleteByTaskId(UUID taskId);

    long deleteByTaskBoardIdAndUserId(UUID boardId, UUID userId);
}
