package com.arkive.backend.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.arkive.backend.model.BoardMember;
import com.arkive.backend.model.BoardMemberRole;

@Repository
public interface BoardMemberRepository extends JpaRepository<BoardMember, UUID> {

    boolean existsByBoardIdAndUserId(UUID boardId, UUID userId);

    Optional<BoardMember> findByBoardIdAndUserId(UUID boardId, UUID userId);

    List<BoardMember> findByBoardIdOrderByJoinedAtAsc(UUID boardId);

    long countByBoardId(UUID boardId);

    boolean existsByBoardIdAndUserIdAndRole(UUID boardId, UUID userId, BoardMemberRole role);
}
