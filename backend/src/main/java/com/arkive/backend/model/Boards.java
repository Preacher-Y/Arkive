package com.arkive.backend.model;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="created_by", nullable=false, foreignKey=@ForeignKey(name="fk_board_owner"))
    private User owner;
}
