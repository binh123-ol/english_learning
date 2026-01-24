package com.example.english.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "learning_statistics")
public class LearningStatistic {
    @Id
    @Column(name = "statistic_id")
    private String statisticId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "stat_date", nullable = false)
    private LocalDate statDate;

    @Column(name = "lessons_completed", nullable = false)
    private Integer lessonsCompleted = 0;

    @Column(name = "games_completed", nullable = false)
    private Integer gamesCompleted = 0;

    @Column(name = "conversations_completed", nullable = false)
    private Integer conversationsCompleted = 0;

    @Column(name = "exams_completed", nullable = false)
    private Integer examsCompleted = 0;

    @Column(name = "total_time_minutes", nullable = false)
    private Integer totalTimeMinutes = 0;

    @Column(name = "xp_earned", nullable = false)
    private Integer xpEarned = 0;

    @Column(name = "streak_days", nullable = false)
    private Integer streakDays = 0;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Getters and Setters
    public String getStatisticId() {
        return statisticId;
    }

    public void setStatisticId(String statisticId) {
        this.statisticId = statisticId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public LocalDate getStatDate() {
        return statDate;
    }

    public void setStatDate(LocalDate statDate) {
        this.statDate = statDate;
    }

    public Integer getLessonsCompleted() {
        return lessonsCompleted;
    }

    public void setLessonsCompleted(Integer lessonsCompleted) {
        this.lessonsCompleted = lessonsCompleted;
    }

    public Integer getGamesCompleted() {
        return gamesCompleted;
    }

    public void setGamesCompleted(Integer gamesCompleted) {
        this.gamesCompleted = gamesCompleted;
    }

    public Integer getConversationsCompleted() {
        return conversationsCompleted;
    }

    public void setConversationsCompleted(Integer conversationsCompleted) {
        this.conversationsCompleted = conversationsCompleted;
    }

    public Integer getTotalTimeMinutes() {
        return totalTimeMinutes;
    }

    public void setTotalTimeMinutes(Integer totalTimeMinutes) {
        this.totalTimeMinutes = totalTimeMinutes;
    }

    public Integer getXpEarned() {
        return xpEarned;
    }

    public void setXpEarned(Integer xpEarned) {
        this.xpEarned = xpEarned;
    }

    public Integer getStreakDays() {
        return streakDays;
    }

    public void setStreakDays(Integer streakDays) {
        this.streakDays = streakDays;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Integer getExamsCompleted() {
        return examsCompleted;
    }

    public void setExamsCompleted(Integer examsCompleted) {
        this.examsCompleted = examsCompleted;
    }
}
