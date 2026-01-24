package com.example.english.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class QuestionDTO {
    
    @NotBlank(message = "Section ID is required")
    private String sectionId;

    @NotBlank(message = "Question type is required")
    private String questionType;

    private String skillType; // LISTENING, READING, WRITING, SPEAKING, GRAMMAR, VOCABULARY

    @NotBlank(message = "Text content is required")
    private String textContent;

    @NotNull(message = "Score points is required")
    @DecimalMin(value = "0.0", message = "Score points must be positive")
    private BigDecimal scorePoints;

    private String correctAnswerText;

    // Getters and Setters
    public String getSectionId() {
        return sectionId;
    }

    public void setSectionId(String sectionId) {
        this.sectionId = sectionId;
    }

    public String getQuestionType() {
        return questionType;
    }

    public void setQuestionType(String questionType) {
        this.questionType = questionType;
    }

    public String getSkillType() {
        return skillType;
    }

    public void setSkillType(String skillType) {
        this.skillType = skillType;
    }

    public String getTextContent() {
        return textContent;
    }

    public void setTextContent(String textContent) {
        this.textContent = textContent;
    }

    public BigDecimal getScorePoints() {
        return scorePoints;
    }

    public void setScorePoints(BigDecimal scorePoints) {
        this.scorePoints = scorePoints;
    }

    public String getCorrectAnswerText() {
        return correctAnswerText;
    }

    public void setCorrectAnswerText(String correctAnswerText) {
        this.correctAnswerText = correctAnswerText;
    }
}
