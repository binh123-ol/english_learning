package com.example.english.controller;

import com.example.english.dto.ExamDTO;
import com.example.english.entity.Exam;
import com.example.english.service.ExamService;
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
@RequestMapping("/api/exams")
@Tag(name = "Exams", description = "Exam management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class ExamController {

    @Autowired
    private ExamService examService;

    @PostMapping
    @Operation(summary = "Create new exam", description = "Create a new exam with title, type, duration, and score")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Exam created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Exam> createExam(@Valid @RequestBody ExamDTO examDTO) {
        Exam exam = new Exam();
        exam.setTitle(examDTO.getTitle());
        exam.setExamType(examDTO.getExamType());
        exam.setLevel(examDTO.getLevel());
        exam.setDurationMinutes(examDTO.getDurationMinutes());
        exam.setTotalScore(examDTO.getTotalScore());

        Exam created = examService.createExam(exam);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get all exams", description = "Retrieve list of all exams")
    @ApiResponse(responseCode = "200", description = "Exams retrieved successfully")
    public ResponseEntity<List<Exam>> getAllExams() {
        return ResponseEntity.ok(examService.getAllExams());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get exam by ID", description = "Retrieve a specific exam by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Exam found"),
            @ApiResponse(responseCode = "404", description = "Exam not found")
    })
    public ResponseEntity<Exam> getExam(@PathVariable String id) {
        return ResponseEntity.ok(examService.getExamById(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update exam", description = "Update an existing exam")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Exam updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "404", description = "Exam not found")
    })
    public ResponseEntity<Exam> updateExam(@PathVariable String id, @Valid @RequestBody ExamDTO examDTO) {
        Exam payload = new Exam();
        payload.setTitle(examDTO.getTitle());
        payload.setExamType(examDTO.getExamType());
        payload.setLevel(examDTO.getLevel());
        payload.setDurationMinutes(examDTO.getDurationMinutes());
        payload.setTotalScore(examDTO.getTotalScore());

        return ResponseEntity.ok(examService.updateExam(id, payload));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete exam", description = "Delete an exam by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Exam deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Exam not found")
    })
    public ResponseEntity<Void> deleteExam(@PathVariable String id) {
        examService.deleteExam(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/users/{userId}/sessions")
    @Operation(summary = "Get user exam sessions", description = "Get all exam sessions for a specific user")
    @ApiResponse(responseCode = "200", description = "Sessions retrieved successfully")
    public ResponseEntity<List<com.example.english.entity.Session>> getUserExamSessions(@PathVariable String userId) {
        return ResponseEntity.ok(examService.getUserExamSessions(userId));
    }
}
