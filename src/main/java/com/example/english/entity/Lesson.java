package com.example.english.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "lessons")
public class Lesson {
    @Id
    @Column(name = "lesson_id")
    private String lessonId;

    @Column(nullable = false)
    private String title;

    @Column(name = "lesson_type", nullable = false)
    private String lessonType; // GRAMMAR, VOCABULARY, LISTENING, READING, WRITING, SPEAKING

    @Column(nullable = false)
    private String level; // BEGINNER, ELEMENTARY, INTERMEDIATE, UPPER_INTERMEDIATE, ADVANCED

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "estimated_duration_minutes")
    private Integer estimatedDurationMinutes;

    @Column(name = "xp_reward", nullable = false)
    private Integer xpReward = 10;

    @Column(name = "difficulty_level", nullable = false)
    private String difficultyLevel; // EASY, MEDIUM, HARD

    @Column(name = "order_index")
    private Integer orderIndex;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    // Getters and Setters
    public String getLessonId() {
        return lessonId;
    }

    public void setLessonId(String lessonId) {
        this.lessonId = lessonId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getLessonType() {
        return lessonType;
    }

    public void setLessonType(String lessonType) {
        this.lessonType = lessonType;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Integer getEstimatedDurationMinutes() {
        return estimatedDurationMinutes;
    }

    public void setEstimatedDurationMinutes(Integer estimatedDurationMinutes) {
        this.estimatedDurationMinutes = estimatedDurationMinutes;
    }

    public Integer getXpReward() {
        return xpReward;
    }

    public void setXpReward(Integer xpReward) {
        this.xpReward = xpReward;
    }

    public String getDifficultyLevel() {
        return difficultyLevel;
    }

    public void setDifficultyLevel(String difficultyLevel) {
        this.difficultyLevel = difficultyLevel;
    }

    public Integer getOrderIndex() {
        return orderIndex;
    }

    public void setOrderIndex(Integer orderIndex) {
        this.orderIndex = orderIndex;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}

