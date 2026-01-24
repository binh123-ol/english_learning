package com.example.english.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "game_rounds")
public class GameRound {
    @Id
    @Column(name = "round_id")
    private String roundId;

    @ManyToOne
    @JoinColumn(name = "room_id", nullable = false)
    private GameRoom room;

    @Column(name = "round_number", nullable = false)
    private Integer roundNumber;

    @Column(name = "round_data", columnDefinition = "TEXT")
    private String roundData; // JSON data

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "finished_at")
    private LocalDateTime finishedAt;

    // Getters and Setters
    public String getRoundId() {
        return roundId;
    }

    public void setRoundId(String roundId) {
        this.roundId = roundId;
    }

    public GameRoom getRoom() {
        return room;
    }

    public void setRoom(GameRoom room) {
        this.room = room;
    }

    public Integer getRoundNumber() {
        return roundNumber;
    }

    public void setRoundNumber(Integer roundNumber) {
        this.roundNumber = roundNumber;
    }

    public String getRoundData() {
        return roundData;
    }

    public void setRoundData(String roundData) {
        this.roundData = roundData;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public LocalDateTime getFinishedAt() {
        return finishedAt;
    }

    public void setFinishedAt(LocalDateTime finishedAt) {
        this.finishedAt = finishedAt;
    }
}




