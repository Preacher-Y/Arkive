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

import com.arkive.backend.DTOs.task.CreateTaskRequestDTO;
import com.arkive.backend.DTOs.task.MoveTaskRequestDTO;
import com.arkive.backend.DTOs.task.TaskDTO;
import com.arkive.backend.DTOs.task.UpdateTaskRequestDTO;
import com.arkive.backend.services.TaskService;

import jakarta.validation.Valid;

@RestController
@Validated
@RequestMapping
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping("/api/columns/{columnId}/tasks")
    public ResponseEntity<TaskDTO> createTask(
            @PathVariable UUID columnId,
            @Valid @RequestBody CreateTaskRequestDTO request) {
        TaskDTO response = taskService.createTask(columnId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/api/tasks/{taskId}")
    public TaskDTO updateTask(
            @PathVariable UUID taskId,
            @Valid @RequestBody UpdateTaskRequestDTO request) {
        return taskService.updateTask(taskId, request);
    }

    @PatchMapping("/api/tasks/{taskId}/move")
    public TaskDTO moveTask(
            @PathVariable UUID taskId,
            @Valid @RequestBody MoveTaskRequestDTO request) {
        return taskService.moveTask(taskId, request);
    }

    @DeleteMapping("/api/tasks/{taskId}")
    public ResponseEntity<Void> deleteTask(@PathVariable UUID taskId) {
        taskService.deleteTask(taskId);
        return ResponseEntity.noContent().build();
    }
}
