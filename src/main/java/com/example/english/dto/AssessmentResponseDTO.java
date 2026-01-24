package com.example.english.dto;

import java.util.List;
import java.util.Map;

public class AssessmentResponseDTO {
    private String assessmentId;
    private Map<String, List<AssessmentQuestionDTO>> questionsBySkill; // skillType -> questions
    private Integer totalQuestions;
    private Integer questionsPerSkill;

    // Getters and Setters
    public String getAssessmentId() {
        return assessmentId;
    }

    public void setAssessmentId(String assessmentId) {
        this.assessmentId = assessmentId;
    }

    public Map<String, List<AssessmentQuestionDTO>> getQuestionsBySkill() {
        return questionsBySkill;
    }

    public void setQuestionsBySkill(Map<String, List<AssessmentQuestionDTO>> questionsBySkill) {
        this.questionsBySkill = questionsBySkill;
    }

    public Integer getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(Integer totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public Integer getQuestionsPerSkill() {
        return questionsPerSkill;
    }

    public void setQuestionsPerSkill(Integer questionsPerSkill) {
        this.questionsPerSkill = questionsPerSkill;
    }
}

