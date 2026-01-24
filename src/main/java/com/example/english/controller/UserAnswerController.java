package com.example.english.controller;

import com.example.english.dto.UserAnswerDTO;
import com.example.english.entity.UserAnswer;
import com.example.english.service.UserAnswerService;
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
@Tag(name = "User Answers", description = "Submit and manage user answers with automatic scoring")
@SecurityRequirement(name = "bearerAuth")
public class UserAnswerController {

    @Autowired
    private UserAnswerService userAnswerService;

    @PostMapping("/sessions/{sessionId}/answers")
    @Operation(summary = "Submit answer", 
        description = "Submit answer for a question with automatic scoring. Validates session time and prevents duplicates.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Answer submitted and scored successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input, session expired, or duplicate answer"),
        @ApiResponse(responseCode = "404", description = "Session or Question not found")
    })
    public ResponseEntity<UserAnswer> submitAnswer(
            @PathVariable String sessionId, 
            @Valid @RequestBody UserAnswerDTO dto) {
        dto.setSessionId(sessionId);
        UserAnswer created = userAnswerService.submitAnswer(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/sessions/{sessionId}/answers")
    @Operation(summary = "Get session answers", description = "Retrieve all answers for a specific session")
    @ApiResponse(responseCode = "200", description = "Answers retrieved successfully")
    public ResponseEntity<List<UserAnswer>> getSessionAnswers(@PathVariable String sessionId) {
        return ResponseEntity.ok(userAnswerService.getAnswersBySession(sessionId));
    }

    @GetMapping("/answers")
    public ResponseEntity<List<UserAnswer>> getAllAnswers() {
        return ResponseEntity.ok(userAnswerService.getAllAnswers());
    }

    @GetMapping("/answers/{id}")
    public ResponseEntity<UserAnswer> getAnswer(@PathVariable String id) {
        return ResponseEntity.ok(userAnswerService.getAnswerById(id));
    }

    @DeleteMapping("/answers/{id}")
    public ResponseEntity<Void> deleteAnswer(@PathVariable String id) {
        userAnswerService.deleteAnswer(id);
        return ResponseEntity.noContent().build();
    }
}
