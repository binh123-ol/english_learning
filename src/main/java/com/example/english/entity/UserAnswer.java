package com.example.english.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_answers")
public class UserAnswer {
    @Id
    @Column(name = "answer_id")
    private String answerId;

    @ManyToOne
    @JoinColumn(name = "session_id", nullable = false)
    private Session session;

    @ManyToOne
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @ManyToOne
    @JoinColumn(name = "selected_option_id")
    private Option selectedOption;

    @Column(name = "text_response", length = 500)
    private String textResponse;

    @Column(name = "is_correct", nullable = false)
    private Boolean isCorrect;

    @Column(name = "score_earned", nullable = false, precision = 5, scale = 2)
    private BigDecimal scoreEarned;

    @Column(name = "answered_at")
    private LocalDateTime answeredAt;

    // Getters and Setters
    public String getAnswerId() {
        return answerId;
    }

    public void setAnswerId(String answerId) {
        this.answerId = answerId;
    }

    public Session getSession() {
        return session;
    }

    public void setSession(Session session) {
        this.session = session;
    }

    public Question getQuestion() {
        return question;
    }

    public void setQuestion(Question question) {
        this.question = question;
    }

    public Option getSelectedOption() {
        return selectedOption;
    }

    public void setSelectedOption(Option selectedOption) {
        this.selectedOption = selectedOption;
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
}