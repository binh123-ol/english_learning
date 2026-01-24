package com.example.english.dto;

import java.math.BigDecimal;
import java.util.List;

public class AssessmentQuestionDTO {
    private String questionId;
    private String skillType;
    private String questionType;
    private String textContent;
    private String audioFileUrl; // For LISTENING questions
    private String readingPassage; // For READING questions
    private BigDecimal scorePoints;
    private String correctAnswerText;
    private String difficultyLevel;
    private Integer orderIndex;
    private List<AssessmentOptionDTO> options;

    // Getters and Setters
    public String getQuestionId() {
        return questionId;
    }

    public void setQuestionId(String questionId) {
        this.questionId = questionId;
    }

    public String getSkillType() {
        return skillType;
    }

    public void setSkillType(String skillType) {
        this.skillType = skillType;
    }

    public String getQuestionType() {
        return questionType;
    }

    public void setQuestionType(String questionType) {
        this.questionType = questionType;
    }

    public String getTextContent() {
        return textContent;
    }

    public void setTextContent(String textContent) {
        this.textContent = textContent;
    }

    public String getAudioFileUrl() {
        return audioFileUrl;
    }

    public void setAudioFileUrl(String audioFileUrl) {
        this.audioFileUrl = audioFileUrl;
    }

    public String getReadingPassage() {
        return readingPassage;
    }

    public void setReadingPassage(String readingPassage) {
        this.readingPassage = readingPassage;
    }

    public BigDecimal getScorePoints() {
        return scorePoints;
    }

    public void setScorePoints(BigDecimal scorePoints) {
        this.scorePoints = scorePoints;
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

    public String getCorrectAnswerText() {
        return correctAnswerText;
    }

    public void setCorrectAnswerText(String correctAnswerText) {
        this.correctAnswerText = correctAnswerText;
    }

    public List<AssessmentOptionDTO> getOptions() {
        return options;
    }

    public void setOptions(List<AssessmentOptionDTO> options) {
        this.options = options;
    }
}



