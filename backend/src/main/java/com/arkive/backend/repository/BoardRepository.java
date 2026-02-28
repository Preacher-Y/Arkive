package com.arkive.backend.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.arkive.backend.model.Board;

@Repository
public interface BoardRepository extends JpaRepository<Board, UUID> {

    List<Board> findDistinctByMembersUserIdOrderByUpdatedAtDesc(UUID userId);
}
