package com.arkive.backend.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.arkive.backend.model.BoardColumn;

@Repository
public interface BoardColumnRepository extends JpaRepository<BoardColumn, UUID> {

    List<BoardColumn> findByBoardIdOrderByPositionAsc(UUID boardId);

    long countByBoardId(UUID boardId);

    BoardColumn findFirstByBoardIdOrderByPositionDesc(UUID boardId);

    List<BoardColumn> findByBoardIdAndPositionGreaterThanEqualOrderByPositionAsc(UUID boardId, int position);

    List<BoardColumn> findByBoardIdAndPositionGreaterThanEqualAndPositionLessThanOrderByPositionAsc(
            UUID boardId,
            int startPosition,
            int endPosition);

    List<BoardColumn> findByBoardIdAndPositionGreaterThanAndPositionLessThanEqualOrderByPositionAsc(
            UUID boardId,
            int startPosition,
            int endPosition);

    List<BoardColumn> findByBoardIdAndPositionGreaterThanOrderByPositionAsc(UUID boardId, int position);
}
