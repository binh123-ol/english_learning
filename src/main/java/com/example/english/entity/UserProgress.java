package com.example.english.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_progress")
public class UserProgress {
    @Id
    @Column(name = "progress_id")
    private String progressId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "lesson_id")
    private Lesson lesson;

    @Column(name = "progress_type", nullable = false)
    private String progressType; // LESSON, GAME, CONVERSATION, ASSESSMENT

    @Column(name = "reference_id") // ID of lesson, game, conversation, etc.
    private String referenceId;

    @Column(name = "progress_percentage", nullable = false)
    private Integer progressPercentage = 0;

    @Column(name = "accuracy_percentage")
    private Integer accuracyPercentage;

    @Column(name = "status", nullable = false)
    private String status; // NOT_STARTED, IN_PROGRESS, COMPLETED

    @Column(name = "xp_earned", nullable = false)
    private Integer xpEarned = 0;

    @Column(name = "last_accessed_at")
    private LocalDateTime lastAccessedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Getters and Setters
    public String getProgressId() {
        return progressId;
    }

    public void setProgressId(String progressId) {
        this.progressId = progressId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Lesson getLesson() {
        return lesson;
    }

    public void setLesson(Lesson lesson) {
        this.lesson = lesson;
    }

    public String getProgressType() {
        return progressType;
    }

    public void setProgressType(String progressType) {
        this.progressType = progressType;
    }

    public String getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(String referenceId) {
        this.referenceId = referenceId;
    }

    public Integer getProgressPercentage() {
        return progressPercentage;
    }

    public void setProgressPercentage(Integer progressPercentage) {
        this.progressPercentage = progressPercentage;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getXpEarned() {
        return xpEarned;
    }

    public void setXpEarned(Integer xpEarned) {
        this.xpEarned = xpEarned;
    }

    public LocalDateTime getLastAccessedAt() {
        return lastAccessedAt;
    }

    public void setLastAccessedAt(LocalDateTime lastAccessedAt) {
        this.lastAccessedAt = lastAccessedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Integer getAccuracyPercentage() {
        return accuracyPercentage;
    }

    public void setAccuracyPercentage(Integer accuracyPercentage) {
        this.accuracyPercentage = accuracyPercentage;
    }
}
