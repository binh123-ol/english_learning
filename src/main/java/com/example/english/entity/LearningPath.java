package com.example.english.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "learning_paths")
public class LearningPath {
    @Id
    @Column(name = "path_id")
    private String pathId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @Column(name = "status", nullable = false)
    private String status; // PENDING, IN_PROGRESS, COMPLETED, SKIPPED

    @Column(name = "progress_percentage", nullable = false)
    private Integer progressPercentage = 0;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "recommended_order")
    private Integer recommendedOrder;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Getters and Setters
    public String getPathId() {
        return pathId;
    }

    public void setPathId(String pathId) {
        this.pathId = pathId;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getProgressPercentage() {
        return progressPercentage;
    }

    public void setProgressPercentage(Integer progressPercentage) {
        this.progressPercentage = progressPercentage;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public Integer getRecommendedOrder() {
        return recommendedOrder;
    }

    public void setRecommendedOrder(Integer recommendedOrder) {
        this.recommendedOrder = recommendedOrder;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}


