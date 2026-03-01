package com.arkive.backend.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.arkive.backend.model.Task;

@Repository
public interface TaskRepository extends JpaRepository<Task, UUID> {

    List<Task> findByColumnIdOrderByPositionAsc(UUID columnId);

    Task findFirstByColumnIdOrderByPositionDesc(UUID columnId);

    long countByColumnId(UUID columnId);

    List<Task> findByColumnIdAndPositionGreaterThanEqualOrderByPositionAsc(UUID columnId, int position);

    List<Task> findByColumnIdAndPositionGreaterThanEqualAndPositionLessThanOrderByPositionAsc(
            UUID columnId,
            int startPosition,
            int endPosition);

    List<Task> findByColumnIdAndPositionGreaterThanAndPositionLessThanEqualOrderByPositionAsc(
            UUID columnId,
            int startPosition,
            int endPosition);

    List<Task> findByColumnIdAndPositionGreaterThanOrderByPositionAsc(UUID columnId, int position);
}
