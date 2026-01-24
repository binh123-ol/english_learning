package com.example.english.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "assessment_options")
public class AssessmentOption {
    @Id
    @Column(name = "option_id")
    private String optionId;

    @ManyToOne
    @JoinColumn(name = "question_id", nullable = false)
    private AssessmentQuestion question;

    @Column(name = "option_text", nullable = false, length = 500)
    private String optionText;

    @Column(name = "is_correct", nullable = false)
    private Boolean isCorrect = false;

    @Column(name = "order_index")
    private Integer orderIndex;

    // Getters and Setters
    public String getOptionId() {
        return optionId;
    }

    public void setOptionId(String optionId) {
        this.optionId = optionId;
    }

    public AssessmentQuestion getQuestion() {
        return question;
    }

    public void setQuestion(AssessmentQuestion question) {
        this.question = question;
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






