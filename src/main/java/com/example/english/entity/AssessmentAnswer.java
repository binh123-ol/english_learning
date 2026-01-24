package com.example.english.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "assessment_answers")
public class AssessmentAnswer {
    @Id
    @Column(name = "answer_id")
    private String answerId;

    @ManyToOne
    @JoinColumn(name = "assessment_id", nullable = false)
    private LevelAssessment assessment;

    @ManyToOne
    @JoinColumn(name = "question_id", nullable = false)
    private AssessmentQuestion question;

    @Column(name = "selected_option_id")
    private String selectedOptionId;

    @Column(name = "text_response", columnDefinition = "TEXT")
    private String textResponse;

    @Column(name = "audio_file_url", length = 500)
    private String audioFileUrl; // For SPEAKING questions - user's recorded audio

    @Column(name = "is_correct")
    private Boolean isCorrect;

    @Column(name = "score_earned", nullable = false, precision = 5, scale = 2)
    private BigDecimal scoreEarned = BigDecimal.ZERO;

    @Column(name = "answered_at")
    private LocalDateTime answeredAt;

    // Getters and Setters
    public String getAnswerId() {
        return answerId;
    }

    public void setAnswerId(String answerId) {
        this.answerId = answerId;
    }

    public LevelAssessment getAssessment() {
        return assessment;
    }

    public void setAssessment(LevelAssessment assessment) {
        this.assessment = assessment;
    }

    public AssessmentQuestion getQuestion() {
        return question;
    }

    public void setQuestion(AssessmentQuestion question) {
        this.question = question;
    }

    public String getSelectedOptionId() {
        return selectedOptionId;
    }

    public void setSelectedOptionId(String selectedOptionId) {
        this.selectedOptionId = selectedOptionId;
    }

    public String getTextResponse() {
        return textResponse;
    }

    public void setTextResponse(String textResponse) {
        this.textResponse = textResponse;
    }

    public Boolean getIsCorrect() {
        return isCorrect;
    }

    public void setIsCorrect(Boolean isCorrect) {
        this.isCorrect = isCorrect;
    }

    public BigDecimal getScoreEarned() {
        return scoreEarned;
    }

    public void setScoreEarned(BigDecimal scoreEarned) {
        this.scoreEarned = scoreEarned;
    }

    public LocalDateTime getAnsweredAt() {
        return answeredAt;
    }

    public void setAnsweredAt(LocalDateTime answeredAt) {
        this.answeredAt = answeredAt;
    }

    public String getAudioFileUrl() {
        return audioFileUrl;
    }

    public void setAudioFileUrl(String audioFileUrl) {
        this.audioFileUrl = audioFileUrl;
    }
}



