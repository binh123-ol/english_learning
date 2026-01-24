package com.example.english.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {
    @Id
    @Column(name = "user_id")
    private String userId;

    @Column(nullable = false, length = 100)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "hashed_password", nullable = false)
    private String hashedPassword;

    @Column(name = "level_target")
    private String levelTarget;

    @Column(name = "current_level")
    private String currentLevel;

    @Column(name = "learning_streak", nullable = false)
    private Integer learningStreak = 0;

    @Column(name = "total_xp", nullable = false)
    private Integer totalXP = 0;

    @Column(name = "assessment_completed", nullable = false)
    private Boolean assessmentCompleted = false;

    @Column(name = "last_activity_date")
    private LocalDateTime lastActivityDate;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Getters and Setters
    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getHashedPassword() {
        return hashedPassword;
    }

    public void setHashedPassword(String hashedPassword) {
        this.hashedPassword = hashedPassword;
    }

    public String getLevelTarget() {
        return levelTarget;
    }

    public void setLevelTarget(String levelTarget) {
        this.levelTarget = levelTarget;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getCurrentLevel() {
        return currentLevel;
    }

    public void setCurrentLevel(String currentLevel) {
        this.currentLevel = currentLevel;
    }

    public Integer getLearningStreak() {
        return learningStreak;
    }

    public void setLearningStreak(Integer learningStreak) {
        this.learningStreak = learningStreak;
    }

    public Integer getTotalXP() {
        return totalXP;
    }

    public void setTotalXP(Integer totalXP) {
        this.totalXP = totalXP;
    }

    public Boolean getAssessmentCompleted() {
        return assessmentCompleted;
    }

    public void setAssessmentCompleted(Boolean assessmentCompleted) {
        this.assessmentCompleted = assessmentCompleted;
    }

    public LocalDateTime getLastActivityDate() {
        return lastActivityDate;
    }

    public void setLastActivityDate(LocalDateTime lastActivityDate) {
        this.lastActivityDate = lastActivityDate;
    }
}