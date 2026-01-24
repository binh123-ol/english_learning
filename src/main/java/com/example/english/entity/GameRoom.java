package com.example.english.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "game_rooms")
public class GameRoom {
    @Id
    @Column(name = "room_id")
    private String roomId;

    @ManyToOne
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;

    @Column(name = "room_name", nullable = false)
    private String roomName;

    @Column(name = "max_players", nullable = false)
    private Integer maxPlayers = 4;

    @Column(name = "current_players", nullable = false)
    private Integer currentPlayers = 0;

    @Column(nullable = false)
    private String status = "WAITING"; // WAITING, PLAYING, FINISHED

    @Column(name = "game_config", columnDefinition = "TEXT")
    private String gameConfig; // JSON config

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "finished_at")
    private LocalDateTime finishedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Getters and Setters
    public String getRoomId() {
        return roomId;
    }

    public void setRoomId(String roomId) {
        this.roomId = roomId;
    }

    public Game getGame() {
        return game;
    }

    public void setGame(Game game) {
        this.game = game;
    }

    public String getRoomName() {
        return roomName;
    }

    public void setRoomName(String roomName) {
        this.roomName = roomName;
    }

    public Integer getMaxPlayers() {
        return maxPlayers;
    }

    public void setMaxPlayers(Integer maxPlayers) {
        this.maxPlayers = maxPlayers;
    }

    public Integer getCurrentPlayers() {
        return currentPlayers;
    }

    public void setCurrentPlayers(Integer currentPlayers) {
        this.currentPlayers = currentPlayers;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getGameConfig() {
        return gameConfig;
    }

    public void setGameConfig(String gameConfig) {
        this.gameConfig = gameConfig;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}




