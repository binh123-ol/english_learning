package com.example.english.controller;

import com.example.english.dto.QuestionDTO;
import com.example.english.entity.Question;
import com.example.english.service.QuestionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@Tag(name = "Questions", description = "Question management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class QuestionController {

    @Autowired
    private QuestionService questionService;

    @PostMapping("/sections/{sectionId}/questions")
    @Operation(summary = "Create question", description = "Create a new question for a section")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Question created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "404", description = "Section not found")
    })
    public ResponseEntity<Question> createQuestion(
            @PathVariable String sectionId, 
            @Valid @RequestBody QuestionDTO dto) {
        dto.setSectionId(sectionId);
        Question created = questionService.createQuestion(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/sections/{sectionId}/questions")
    @Operation(summary = "Get section questions", description = "Get all questions for a specific section")
    @ApiResponse(responseCode = "200", description = "Questions retrieved successfully")
    public ResponseEntity<List<Question>> getSectionQuestions(@PathVariable String sectionId) {
        return ResponseEntity.ok(questionService.getQuestionsBySection(sectionId));
    }

    @GetMapping("/questions")
    @Operation(summary = "Get all questions", description = "Retrieve list of all questions")
    @ApiResponse(responseCode = "200", description = "Questions retrieved successfully")
    public ResponseEntity<List<Question>> getAllQuestions() {
        return ResponseEntity.ok(questionService.getAllQuestions());
    }

    @GetMapping("/questions/{id}")
    @Operation(summary = "Get question by ID", description = "Retrieve a specific question")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Question found"),
        @ApiResponse(responseCode = "404", description = "Question not found")
    })
    public ResponseEntity<Question> getQuestion(@PathVariable String id) {
        return ResponseEntity.ok(questionService.getQuestionById(id));
    }

    @PutMapping("/questions/{id}")
    @Operation(summary = "Update question", description = "Update an existing question")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Question updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "404", description = "Question not found")
    })
    public ResponseEntity<Question> updateQuestion(
            @PathVariable String id, 
            @Valid @RequestBody QuestionDTO dto) {
        return ResponseEntity.ok(questionService.updateQuestion(id, dto));
    }

    @DeleteMapping("/questions/{id}")
    @Operation(summary = "Delete question", description = "Delete a question by ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Question deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Question not found")
    })
    public ResponseEntity<Void> deleteQuestion(@PathVariable String id) {
        questionService.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    }
}
