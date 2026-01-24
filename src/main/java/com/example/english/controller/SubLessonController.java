package com.example.english.controller;

import com.example.english.entity.SubLesson;
import com.example.english.service.SubLessonService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lessons")
@Tag(name = "Sub-Lessons", description = "Sub-lesson management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class SubLessonController {

    @Autowired
    private SubLessonService subLessonService;

    @GetMapping("/{lessonId}/sub-lessons")
    @Operation(summary = "Get all sub-lessons for a lesson")
    public ResponseEntity<List<SubLesson>> getSubLessonsByLessonId(@PathVariable String lessonId) {
        List<SubLesson> subLessons = subLessonService.getSubLessonsByLessonId(lessonId);
        return ResponseEntity.ok(subLessons);
    }

    @GetMapping("/sub-lessons/{subLessonId}")
    @Operation(summary = "Get sub-lesson by ID")
    public ResponseEntity<SubLesson> getSubLessonById(@PathVariable String subLessonId) {
        SubLesson subLesson = subLessonService.getSubLessonById(subLessonId);
        return ResponseEntity.ok(subLesson);
    }

    @PostMapping("/{lessonId}/sub-lessons")
    @Operation(summary = "Create a new sub-lesson")
    public ResponseEntity<SubLesson> createSubLesson(@PathVariable String lessonId, @RequestBody SubLesson subLesson) {
        SubLesson created = subLessonService.createSubLesson(lessonId, subLesson);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/sub-lessons/{subLessonId}")
    @Operation(summary = "Update a sub-lesson")
    public ResponseEntity<SubLesson> updateSubLesson(@PathVariable String subLessonId, @RequestBody SubLesson subLesson) {
        SubLesson updated = subLessonService.updateSubLesson(subLessonId, subLesson);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/sub-lessons/{subLessonId}")
    @Operation(summary = "Delete a sub-lesson")
    public ResponseEntity<Void> deleteSubLesson(@PathVariable String subLessonId) {
        subLessonService.deleteSubLesson(subLessonId);
        return ResponseEntity.noContent().build();
    }
}




