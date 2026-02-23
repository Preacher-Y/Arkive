package com.arkive.backend.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.arkive.backend.model.Boards;

public interface BoardRepository extends JpaRepository<Boards, UUID> {

}
