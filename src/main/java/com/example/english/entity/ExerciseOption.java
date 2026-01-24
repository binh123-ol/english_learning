package com.example.english.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
@Table(name = "exercise_options")
public class ExerciseOption {
    @Id
    @Column(name = "option_id")
    private String optionId;

    @ManyToOne
    @JoinColumn(name = "exercise_id", nullable = false)
    @JsonBackReference
    private LessonExercise exercise;

    @Column(name = "option_text", nullable = false, length = 500)
    private String optionText;

    @Column(name = "is_correct", nullable = false)
    private Boolean isCorrect = false;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    // Getters and Setters
    public String getOptionId() {
        return optionId;
    }

    public void setOptionId(String optionId) {
        this.optionId = optionId;
    }

    public LessonExercise getExercise() {
        return exercise;
    }

    public void setExercise(LessonExercise exercise) {
        this.exercise = exercise;
    }

    public String getOptionText() {
        return optionText;
    }

    public void setOptionText(String optionText) {
        this.optionText = optionText;
    }

    public Boolean getIsCorrect() {
        return isCorrect;
    }

    public void setIsCorrect(Boolean isCorrect) {
        this.isCorrect = isCorrect;
    }

    public Integer getOrderIndex() {
        return orderIndex;
    }

    public void setOrderIndex(Integer orderIndex) {
        this.orderIndex = orderIndex;
    }
}
