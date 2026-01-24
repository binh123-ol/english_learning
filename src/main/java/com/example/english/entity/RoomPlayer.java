package com.example.english.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "room_players")
public class RoomPlayer {
    @Id
    @Column(name = "room_player_id")
    private String roomPlayerId;

    @ManyToOne
    @JoinColumn(name = "room_id", nullable = false)
    private GameRoom room;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal score = BigDecimal.ZERO;

    @Column(name = "completion_time_seconds")
    private Integer completionTimeSeconds; // Thời gian hoàn thành (giây)

    @Column(name = "mistakes_count", nullable = false)
    private Integer mistakesCount = 0; // Số lỗi

    @Column(name = "rank_position")
    private Integer rankPosition; // Vị trí xếp hạng (1, 2, 3, 4...)

    @Column(nullable = false)
    private String status = "JOINED"; // JOINED, READY, PLAYING, FINISHED

    @Column(name = "joined_at")
    private LocalDateTime joinedAt;

    @Column(name = "finished_at")
    private LocalDateTime finishedAt;

    // Getters and Setters
    public String getRoomPlayerId() {
        return roomPlayerId;
    }

    public void setRoomPlayerId(String roomPlayerId) {
        this.roomPlayerId = roomPlayerId;
    }

    public GameRoom getRoom() {
        return room;
    }

    public void setRoom(GameRoom room) {
        this.room = room;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public BigDecimal getScore() {
        return score;
    }

    public void setScore(BigDecimal score) {
        this.score = score;
    }

    public Integer getCompletionTimeSeconds() {
        return completionTimeSeconds;
    }

    public void setCompletionTimeSeconds(Integer completionTimeSeconds) {
        this.completionTimeSeconds = completionTimeSeconds;
    }

    public Integer getMistakesCount() {
        return mistakesCount;
    }

    public void setMistakesCount(Integer mistakesCount) {
        this.mistakesCount = mistakesCount;
    }

    public Integer getRankPosition() {
        return rankPosition;
    }

    public void setRankPosition(Integer rankPosition) {
        this.rankPosition = rankPosition;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(LocalDateTime joinedAt) {
        this.joinedAt = joinedAt;
    }

    public LocalDateTime getFinishedAt() {
        return finishedAt;
    }

    public void setFinishedAt(LocalDateTime finishedAt) {
        this.finishedAt = finishedAt;
    }
}




