package com.example.english.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "sessions")
public class Session {
    @Id
    @Column(name = "session_id")
    private String sessionId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "finished_at")
    private LocalDateTime finishedAt;

    @Column(name = "total_correct")
    private Integer totalCorrect = 0;

    @Column(name = "final_score", precision = 5, scale = 2)
    private BigDecimal finalScore = BigDecimal.ZERO;

    @Column(name = "band_score", precision = 3, scale = 1)
    private BigDecimal bandScore;

    // Getters and Setters
    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Exam getExam() {
        return exam;
    }

    public void setExam(Exam exam) {
        this.exam = exam;
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

    public Integer getTotalCorrect() {
        return totalCorrect;
    }

    public void setTotalCorrect(Integer totalCorrect) {
        this.totalCorrect = totalCorrect;
    }

    public BigDecimal getFinalScore() {
        return finalScore;
    }

    public void setFinalScore(BigDecimal finalScore) {
        this.finalScore = finalScore;
    }

    public BigDecimal getBandScore() {
        return bandScore;
    }

    public void setBandScore(BigDecimal bandScore) {
        this.bandScore = bandScore;
    }
}