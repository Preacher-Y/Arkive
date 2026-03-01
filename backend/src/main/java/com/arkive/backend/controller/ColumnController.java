package com.arkive.backend.controller;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.arkive.backend.DTOs.column.ColumnDTO;
import com.arkive.backend.DTOs.column.CreateColumnRequestDTO;
import com.arkive.backend.DTOs.column.UpdateColumnRequestDTO;
import com.arkive.backend.services.ColumnService;

import jakarta.validation.Valid;

@RestController
@Validated
@RequestMapping
public class ColumnController {

    private final ColumnService columnService;

    public ColumnController(ColumnService columnService) {
        this.columnService = columnService;
    }

    @PostMapping("/api/boards/{boardId}/columns")
    public ResponseEntity<ColumnDTO> createColumn(
            @PathVariable UUID boardId,
            @Valid @RequestBody CreateColumnRequestDTO request) {
        ColumnDTO response = columnService.createColumn(boardId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/api/columns/{columnId}")
    public ColumnDTO updateColumn(
            @PathVariable UUID columnId,
            @Valid @RequestBody UpdateColumnRequestDTO request) {
        return columnService.updateColumn(columnId, request);
    }

    @DeleteMapping("/api/columns/{columnId}")
    public ResponseEntity<Void> deleteColumn(@PathVariable UUID columnId) {
        columnService.deleteColumn(columnId);
        return ResponseEntity.noContent().build();
    }
}
