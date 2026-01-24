package com.example.english.controller;

import com.example.english.dto.SectionDTO;
import com.example.english.entity.Section;
import com.example.english.service.SectionService;
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
@Tag(name = "Sections", description = "Exam section management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class SectionController {

    @Autowired
    private SectionService sectionService;

    @PostMapping("/exams/{examId}/sections")
    @Operation(summary = "Create section", description = "Create a new section for an exam")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Section created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "404", description = "Exam not found")
    })
    public ResponseEntity<Section> createSection(
            @PathVariable String examId, 
            @Valid @RequestBody SectionDTO dto) {
        dto.setExamId(examId);
        Section created = sectionService.createSection(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/exams/{examId}/sections")
    @Operation(summary = "Get exam sections", description = "Get all sections for a specific exam")
    @ApiResponse(responseCode = "200", description = "Sections retrieved successfully")
    public ResponseEntity<List<Section>> getExamSections(@PathVariable String examId) {
        return ResponseEntity.ok(sectionService.getSectionsByExam(examId));
    }

    @GetMapping("/sections")
    @Operation(summary = "Get all sections", description = "Retrieve list of all sections")
    @ApiResponse(responseCode = "200", description = "Sections retrieved successfully")
    public ResponseEntity<List<Section>> getAllSections() {
        return ResponseEntity.ok(sectionService.getAllSections());
    }

    @GetMapping("/sections/{id}")
    @Operation(summary = "Get section by ID", description = "Retrieve a specific section")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Section found"),
        @ApiResponse(responseCode = "404", description = "Section not found")
    })
    public ResponseEntity<Section> getSection(@PathVariable String id) {
        return ResponseEntity.ok(sectionService.getSectionById(id));
    }

    @PutMapping("/sections/{id}")
    @Operation(summary = "Update section", description = "Update an existing section")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Section updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "404", description = "Section not found")
    })
    public ResponseEntity<Section> updateSection(
            @PathVariable String id, 
            @Valid @RequestBody SectionDTO dto) {
        return ResponseEntity.ok(sectionService.updateSection(id, dto));
    }

    @DeleteMapping("/sections/{id}")
    @Operation(summary = "Delete section", description = "Delete a section by ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Section deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Section not found")
    })
    public ResponseEntity<Void> deleteSection(@PathVariable String id) {
        sectionService.deleteSection(id);
        return ResponseEntity.noContent().build();
    }
}
