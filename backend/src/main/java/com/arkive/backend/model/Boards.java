package com.arkive.backend.model;

import java.util.UUID;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "Boards")

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor

public class Boards {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name="boards_id")
    private UUID id;

    @Column(nullable=false)
    private String name;

    @Column(nullable=false)
    private UUID createdBy;
}
