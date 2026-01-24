package com.example.english.dto;

import jakarta.validation.constraints.NotBlank;

public class UserAnswerDTO {
    
    // Session ID is set from path variable, not from request body
    private String sessionId;

    @NotBlank(message = "Question ID is required")
    private String questionId;

    private String selectedOptionId;

    private String textResponse;

    // Getters and Setters
    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getQuestionId() {
        return questionId;
    }

    public void setQuestionId(String questionId) {
        this.questionId = questionId;
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
}
