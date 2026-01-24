package com.example.english.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "assessment_questions")
public class AssessmentQuestion {
    @Id
    @Column(name = "question_id")
    private String questionId;

    @Column(name = "skill_type", nullable = false)
    private String skillType; // LISTENING, READING, WRITING, SPEAKING, GRAMMAR, VOCABULARY

    @Column(name = "question_type", nullable = false)
    private String questionType; // MULTIPLE_CHOICE, FILL_BLANK, TRUE_FALSE, TEXT_INPUT

    @Column(name = "text_content", columnDefinition = "TEXT", nullable = false)
    private String textContent;

    @Column(name = "audio_file_url", length = 500)
    private String audioFileUrl; // For LISTENING questions

    @Column(name = "reading_passage", columnDefinition = "TEXT")
    private String readingPassage; // For READING questions - the passage to read

    @Column(name = "score_points", nullable = false, precision = 5, scale = 2)
    private BigDecimal scorePoints;

    @Column(name = "correct_answer_text", columnDefinition = "TEXT")
    private String correctAnswerText;

    @Column(name = "difficulty_level")
    private String difficultyLevel; // BEGINNER, ELEMENTARY, INTERMEDIATE, UPPER_INTERMEDIATE, ADVANCED

    @Column(name = "order_index")
    private Integer orderIndex;

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
}



