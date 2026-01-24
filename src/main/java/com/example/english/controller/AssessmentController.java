package com.example.english.controller;

import com.example.english.dto.*;
import com.example.english.entity.AssessmentQuestion;
import com.example.english.entity.LevelAssessment;
import com.example.english.service.AssessmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/assessments")
@Tag(name = "Assessments", description = "Level assessment and initial evaluation")
@SecurityRequirement(name = "bearerAuth")
public class AssessmentController {

    @Autowired
    private AssessmentService assessmentService;

    @PostMapping("/users/{userId}")
    @Operation(summary = "Create level assessment", description = "Start a new level assessment for a user")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Assessment created successfully"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<LevelAssessment> createAssessment(@PathVariable String userId) {
        LevelAssessment assessment = assessmentService.createAssessment(userId);
        return new ResponseEntity<>(assessment, HttpStatus.CREATED);
    }

    @PostMapping("/{assessmentId}/complete")
    @Operation(summary = "Complete assessment", description = "Complete assessment with scores for all skills")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Assessment completed successfully"),
        @ApiResponse(responseCode = "400", description = "Assessment already completed"),
        @ApiResponse(responseCode = "404", description = "Assessment not found")
    })
    public ResponseEntity<LevelAssessment> completeAssessment(
            @PathVariable String assessmentId,
            @RequestBody AssessmentScoresRequest request) {
        LevelAssessment assessment = assessmentService.completeAssessment(
                assessmentId,
                request.getListeningScore(),
                request.getReadingScore(),
                request.getWritingScore(),
                request.getSpeakingScore(),
                request.getGrammarScore(),
                request.getVocabularyScore()
        );
        return ResponseEntity.ok(assessment);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get assessment", description = "Get assessment by ID")
    public ResponseEntity<LevelAssessment> getAssessment(@PathVariable String id) {
        return ResponseEntity.ok(assessmentService.getAssessmentById(id));
    }

    @GetMapping("/users/{userId}")
    @Operation(summary = "Get user assessments", description = "Get all assessments for a user")
    public ResponseEntity<List<LevelAssessment>> getUserAssessments(@PathVariable String userId) {
        return ResponseEntity.ok(assessmentService.getUserAssessments(userId));
    }

    @GetMapping("/users/{userId}/latest")
    @Operation(summary = "Get latest assessment", description = "Get the latest assessment for a user")
    public ResponseEntity<LevelAssessment> getLatestAssessment(@PathVariable String userId) {
        return ResponseEntity.ok(assessmentService.getLatestAssessment(userId));
    }

    @GetMapping("/{assessmentId}/questions")
    @Operation(summary = "Get assessment questions", description = "Get all questions for an assessment grouped by skill")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Questions retrieved successfully"),
        @ApiResponse(responseCode = "400", description = "Assessment already completed"),
        @ApiResponse(responseCode = "404", description = "Assessment not found")
    })
    public ResponseEntity<AssessmentResponseDTO> getAssessmentQuestions(@PathVariable String assessmentId) {
        return ResponseEntity.ok(assessmentService.getAssessmentQuestions(assessmentId));
    }

    @PostMapping("/{assessmentId}/submit")
    @Operation(summary = "Submit assessment answers", description = "Submit answers and automatically calculate scores")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Assessment completed successfully"),
        @ApiResponse(responseCode = "400", description = "Assessment already completed or invalid answers"),
        @ApiResponse(responseCode = "404", description = "Assessment not found")
    })
    public ResponseEntity<AssessmentResultDTO> submitAnswers(
            @PathVariable String assessmentId,
            @RequestBody List<AssessmentAnswerDTO> answers) {
        return ResponseEntity.ok(assessmentService.submitAnswers(assessmentId, answers));
    }

    // Admin endpoints for managing assessment questions
    @PostMapping("/questions")
    @Operation(summary = "Create assessment question", description = "Create a new assessment question (Admin only)")
    public ResponseEntity<AssessmentQuestion> createAssessmentQuestion(
            @RequestBody AssessmentQuestionDTO dto) {
        return new ResponseEntity<>(assessmentService.createAssessmentQuestion(dto), HttpStatus.CREATED);
    }

    @GetMapping("/questions")
    @Operation(summary = "Get all assessment questions", description = "Get all assessment questions (Admin only)")
    public ResponseEntity<List<AssessmentQuestion>> getAllAssessmentQuestions() {
        return ResponseEntity.ok(assessmentService.getAllAssessmentQuestions());
    }

    @GetMapping("/questions/skill/{skillType}")
    @Operation(summary = "Get questions by skill", description = "Get assessment questions by skill type (Admin only)")
    public ResponseEntity<List<AssessmentQuestion>> getQuestionsBySkill(
            @PathVariable String skillType) {
        return ResponseEntity.ok(assessmentService.getAssessmentQuestionsBySkill(skillType));
    }

    @GetMapping("/questions/{questionId}")
    @Operation(summary = "Get assessment question", description = "Get assessment question by ID (Admin only)")
    public ResponseEntity<AssessmentQuestion> getAssessmentQuestion(
            @PathVariable String questionId) {
        return ResponseEntity.ok(assessmentService.getAssessmentQuestionById(questionId));
    }

    @PutMapping("/questions/{questionId}")
    @Operation(summary = "Update assessment question", description = "Update an assessment question (Admin only)")
    public ResponseEntity<AssessmentQuestion> updateAssessmentQuestion(
            @PathVariable String questionId,
            @RequestBody AssessmentQuestionDTO dto) {
        return ResponseEntity.ok(assessmentService.updateAssessmentQuestion(questionId, dto));
    }

    @DeleteMapping("/questions/{questionId}")
    @Operation(summary = "Delete assessment question", description = "Delete an assessment question (Admin only)")
    public ResponseEntity<Void> deleteAssessmentQuestion(@PathVariable String questionId) {
        assessmentService.deleteAssessmentQuestion(questionId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/templates/{templateName}")
    @Operation(summary = "Create assessment template", description = "Create a preset assessment template with sample questions (Admin only)")
    public ResponseEntity<String> createAssessmentTemplate(@PathVariable String templateName) {
        assessmentService.createAssessmentTemplate(templateName);
        return ResponseEntity.ok("Assessment template '" + templateName + "' created successfully");
    }

    // Inner class for request body
    public static class AssessmentScoresRequest {
        private BigDecimal listeningScore;
        private BigDecimal readingScore;
        private BigDecimal writingScore;
        private BigDecimal speakingScore;
        private BigDecimal grammarScore;
        private BigDecimal vocabularyScore;

        // Getters and Setters
        public BigDecimal getListeningScore() { return listeningScore; }
        public void setListeningScore(BigDecimal listeningScore) { this.listeningScore = listeningScore; }
        public BigDecimal getReadingScore() { return readingScore; }
        public void setReadingScore(BigDecimal readingScore) { this.readingScore = readingScore; }
        public BigDecimal getWritingScore() { return writingScore; }
        public void setWritingScore(BigDecimal writingScore) { this.writingScore = writingScore; }
        public BigDecimal getSpeakingScore() { return speakingScore; }
        public void setSpeakingScore(BigDecimal speakingScore) { this.speakingScore = speakingScore; }
        public BigDecimal getGrammarScore() { return grammarScore; }
        public void setGrammarScore(BigDecimal grammarScore) { this.grammarScore = grammarScore; }
        public BigDecimal getVocabularyScore() { return vocabularyScore; }
        public void setVocabularyScore(BigDecimal vocabularyScore) { this.vocabularyScore = vocabularyScore; }
    }
}


