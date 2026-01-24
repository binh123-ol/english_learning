package com.example.english.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "level_assessments")
public class LevelAssessment {
    @Id
    @Column(name = "assessment_id")
    private String assessmentId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "listening_score", precision = 5, scale = 2)
    private BigDecimal listeningScore;

    @Column(name = "reading_score", precision = 5, scale = 2)
    private BigDecimal readingScore;

    @Column(name = "writing_score", precision = 5, scale = 2)
    private BigDecimal writingScore;

    @Column(name = "speaking_score", precision = 5, scale = 2)
    private BigDecimal speakingScore;

    @Column(name = "grammar_score", precision = 5, scale = 2)
    private BigDecimal grammarScore;

    @Column(name = "vocabulary_score", precision = 5, scale = 2)
    private BigDecimal vocabularyScore;

    @Column(name = "overall_level")
    private String overallLevel; // BEGINNER, ELEMENTARY, INTERMEDIATE, UPPER_INTERMEDIATE, ADVANCED

    @Column(name = "overall_score", precision = 5, scale = 2)
    private BigDecimal overallScore;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Getters and Setters
    public String getAssessmentId() {
        return assessmentId;
    }

    public void setAssessmentId(String assessmentId) {
        this.assessmentId = assessmentId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public BigDecimal getListeningScore() {
        return listeningScore;
    }

    public void setListeningScore(BigDecimal listeningScore) {
        this.listeningScore = listeningScore;
    }

    public BigDecimal getReadingScore() {
        return readingScore;
    }

    public void setReadingScore(BigDecimal readingScore) {
        this.readingScore = readingScore;
    }

    public BigDecimal getWritingScore() {
        return writingScore;
    }

    public void setWritingScore(BigDecimal writingScore) {
        this.writingScore = writingScore;
    }

    public BigDecimal getSpeakingScore() {
        return speakingScore;
    }

    public void setSpeakingScore(BigDecimal speakingScore) {
        this.speakingScore = speakingScore;
    }

    public BigDecimal getGrammarScore() {
        return grammarScore;
    }

    public void setGrammarScore(BigDecimal grammarScore) {
        this.grammarScore = grammarScore;
    }

    public BigDecimal getVocabularyScore() {
        return vocabularyScore;
    }

    public void setVocabularyScore(BigDecimal vocabularyScore) {
        this.vocabularyScore = vocabularyScore;
    }

    public String getOverallLevel() {
        return overallLevel;
    }

    public void setOverallLevel(String overallLevel) {
        this.overallLevel = overallLevel;
    }

    public BigDecimal getOverallScore() {
        return overallScore;
    }

    public void setOverallScore(BigDecimal overallScore) {
        this.overallScore = overallScore;
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
}


