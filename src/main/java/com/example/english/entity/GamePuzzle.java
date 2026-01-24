package com.example.english.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "game_puzzles")
public class GamePuzzle {
    @Id
    @Column(name = "puzzle_id")
    private String puzzleId;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;

    @Column(nullable = false)
    private String sentence;

    @Column(nullable = false)
    private String hint; // Vietnamese translation

    @Column(name = "puzzle_type")
    private String puzzleType; // sentence, phrase

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (puzzleId == null) {
            puzzleId = java.util.UUID.randomUUID().toString();
        }
    }

    // Getters and Setters
    public String getPuzzleId() {
        return puzzleId;
    }

    public void setPuzzleId(String puzzleId) {
        this.puzzleId = puzzleId;
    }

    public Game getGame() {
        return game;
    }

    public void setGame(Game game) {
        this.game = game;
    }

    public String getSentence() {
        return sentence;
    }

    public void setSentence(String sentence) {
        this.sentence = sentence;
    }

    public String getHint() {
        return hint;
    }

    public void setHint(String hint) {
        this.hint = hint;
    }

    public String getPuzzleType() {
        return puzzleType;
    }

    public void setPuzzleType(String puzzleType) {
        this.puzzleType = puzzleType;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
