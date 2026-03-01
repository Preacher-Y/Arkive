package com.arkive.backend.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.arkive.backend.model.BoardPreference;

@Repository
public interface BoardPreferenceRepository extends JpaRepository<BoardPreference, UUID> {

    Optional<BoardPreference> findByBoardIdAndUserId(UUID boardId, UUID userId);

    void deleteByBoardIdAndUserId(UUID boardId, UUID userId);
}
