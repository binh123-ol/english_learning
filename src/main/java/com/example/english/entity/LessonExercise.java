package com.example.english.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "lesson_exercises")
public class LessonExercise {
    @Id
    @Column(name = "exercise_id")
    private String exerciseId;

    @ManyToOne
    @JoinColumn(name = "sub_lesson_id", nullable = false)
    private SubLesson subLesson;

    @Column(name = "exercise_type", nullable = false)
    private String exerciseType; // MULTIPLE_CHOICE, FILL_BLANK, TEXT_INPUT, MATCHING

    @Column(nullable = false)
    private String title;

    @Column(name = "question_text", columnDefinition = "TEXT", nullable = false)
    private String questionText;

    @Column(name = "correct_answer", columnDefinition = "TEXT")
    private String correctAnswer;

    @Column(name = "score_points", nullable = false, precision = 5, scale = 2)
    private BigDecimal scorePoints = BigDecimal.valueOf(10.0);

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "exercise", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<ExerciseOption> options;

    // Getters and Setters
    public String getExerciseId() {
        return exerciseId;
    }

    public void setExerciseId(String exerciseId) {
        this.exerciseId = exerciseId;
    }

    public SubLesson getSubLesson() {
        return subLesson;
    }

    public void setSubLesson(SubLesson subLesson) {
        this.subLesson = subLesson;
    }

    public String getExerciseType() {
        return exerciseType;
    }

    public void setExerciseType(String exerciseType) {
        this.exerciseType = exerciseType;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getQuestionText() {
        return questionText;
    }

    public void setQuestionText(String questionText) {
        this.questionText = questionText;
    }

    public String getCorrectAnswer() {
        return correctAnswer;
    }

    public void setCorrectAnswer(String correctAnswer) {
        this.correctAnswer = correctAnswer;
    }

    public BigDecimal getScorePoints() {
        return scorePoints;
    }

    public void setScorePoints(BigDecimal scorePoints) {
        this.scorePoints = scorePoints;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<ExerciseOption> getOptions() {
        return options;
    }

    public void setOptions(List<ExerciseOption> options) {
        this.options = options;
    }
}
