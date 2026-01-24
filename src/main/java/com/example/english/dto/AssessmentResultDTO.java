package com.example.english.dto;

import java.math.BigDecimal;

public class AssessmentResultDTO {
    private String assessmentId;
    private BigDecimal listeningScore;
    private BigDecimal readingScore;
    private BigDecimal writingScore;
    private BigDecimal speakingScore;
    private BigDecimal grammarScore;
    private BigDecimal vocabularyScore;
    private BigDecimal overallScore;
    private String overallLevel;
    private Integer totalQuestions;
    private Integer correctAnswers;

    // Getters and Setters
    public String getAssessmentId() {
        return assessmentId;
    }

    public void setAssessmentId(String assessmentId) {
        this.assessmentId = assessmentId;
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

    public BigDecimal getOverallScore() {
        return overallScore;
    }

    public void setOverallScore(BigDecimal overallScore) {
        this.overallScore = overallScore;
    }

    public String getOverallLevel() {
        return overallLevel;
    }

    public void setOverallLevel(String overallLevel) {
        this.overallLevel = overallLevel;
    }

    public Integer getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(Integer totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public Integer getCorrectAnswers() {
        return correctAnswers;
    }

    public void setCorrectAnswers(Integer correctAnswers) {
        this.correctAnswers = correctAnswers;
    }
}






