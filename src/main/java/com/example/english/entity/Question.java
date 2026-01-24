package com.example.english.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "questions")
public class Question {
    @Id
    @Column(name = "question_id")
    private String questionId;

    @ManyToOne
    @JoinColumn(name = "section_id", nullable = false)
    private Section section;

    @Column(name = "question_type", nullable = false)
    private String questionType;

    @Column(name = "skill_type")
    private String skillType; // LISTENING, READING, WRITING, SPEAKING, GRAMMAR, VOCABULARY

    @Column(name = "text_content", columnDefinition = "TEXT", nullable = false)
    private String textContent;

    @Column(name = "score_points", nullable = false, precision = 5, scale = 2)
    private BigDecimal scorePoints;

    @Column(name = "correct_answer_text")
    private String correctAnswerText;

    // Getters and Setters
    public String getQuestionId() {
        return questionId;
    }

    public void setQuestionId(String questionId) {
        this.questionId = questionId;
    }

    public Section getSection() {
        return section;
    }

    public void setSection(Section section) {
        this.section = section;
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