package com.example.english.controller;

import com.example.english.entity.LearningPath;
import com.example.english.entity.Lesson;
import com.example.english.service.LessonService;
import com.example.english.service.RecommendationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lessons")
@Tag(name = "Lessons", description = "Lesson management and learning paths")
@SecurityRequirement(name = "bearerAuth")
public class LessonController {

    @Autowired
    private LessonService lessonService;

    @Autowired
    private RecommendationService recommendationService;

    @GetMapping
    @Operation(summary = "Get all lessons", description = "Get all available lessons")
    public ResponseEntity<List<Lesson>> getAllLessons() {
        return ResponseEntity.ok(lessonService.getAllLessons());
    }

    @GetMapping("/level/{level}")
    @Operation(summary = "Get lessons by level", description = "Get lessons for a specific level")
    public ResponseEntity<List<Lesson>> getLessonsByLevel(@PathVariable String level) {
        return ResponseEntity.ok(lessonService.getLessonsByLevel(level));
    }

    @GetMapping("/type/{lessonType}")
    @Operation(summary = "Get lessons by type", description = "Get lessons by lesson type")
    public ResponseEntity<List<Lesson>> getLessonsByType(@PathVariable String lessonType) {
        return ResponseEntity.ok(lessonService.getLessonsByType(lessonType));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get lesson", description = "Get lesson by ID")
    public ResponseEntity<Lesson> getLesson(@PathVariable String id) {
        return ResponseEntity.ok(lessonService.getLessonById(id));
    }

    @PostMapping("/users/{userId}/start/{lessonId}")
    @Operation(summary = "Start lesson", description = "Start a lesson for a user")
    public ResponseEntity<LearningPath> startLesson(
            @PathVariable String userId,
            @PathVariable String lessonId) {
        LearningPath path = lessonService.startLesson(userId, lessonId);
        return new ResponseEntity<>(path, HttpStatus.CREATED);
    }

    @PostMapping("/users/{userId}/complete/{lessonId}")
    @Operation(summary = "Complete lesson", description = "Mark a lesson as completed")
    public ResponseEntity<LearningPath> completeLesson(
            @PathVariable String userId,
            @PathVariable String lessonId,
            @RequestParam(required = false) Integer accuracyPercentage) {
        return ResponseEntity.ok(lessonService.completeLesson(userId, lessonId, accuracyPercentage));
    }

    @PutMapping("/users/{userId}/progress/{lessonId}")
    @Operation(summary = "Update lesson progress", description = "Update progress percentage for a lesson")
    public ResponseEntity<LearningPath> updateProgress(
            @PathVariable String userId,
            @PathVariable String lessonId,
            @RequestParam Integer progressPercentage,
            @RequestParam(required = false) Integer accuracyPercentage) {
        return ResponseEntity
                .ok(lessonService.updateLessonProgress(userId, lessonId, progressPercentage, accuracyPercentage));
    }

    @GetMapping("/users/{userId}/recommended")
    @Operation(summary = "Get recommended lessons", description = "Get personalized lesson recommendations")
    public ResponseEntity<List<Lesson>> getRecommendedLessons(@PathVariable String userId) {
        return ResponseEntity.ok(recommendationService.recommendLessonsForWeakAreas(userId));
    }

    @GetMapping("/users/{userId}/progress")
    @Operation(summary = "Get user lesson progress", description = "Get all lesson progress for a user")
    public ResponseEntity<List<com.example.english.entity.UserProgress>> getUserProgress(@PathVariable String userId) {
        return ResponseEntity.ok(lessonService.getUserProgress(userId));
    }

    @GetMapping("/users/{userId}/learning-path")
    @Operation(summary = "Get learning path", description = "Get personalized learning path for user")
    public ResponseEntity<List<LearningPath>> getLearningPath(@PathVariable String userId) {
        return ResponseEntity.ok(recommendationService.generateLearningPath(userId));
    }

    @PostMapping
    @Operation(summary = "Create lesson", description = "Create a new lesson (Admin only)")
    public ResponseEntity<Lesson> createLesson(@RequestBody Lesson lesson) {
        Lesson created = lessonService.createLesson(lesson);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update lesson", description = "Update an existing lesson (Admin only)")
    public ResponseEntity<Lesson> updateLesson(@PathVariable String id, @RequestBody Lesson lesson) {
        lesson.setLessonId(id);
        Lesson updated = lessonService.updateLesson(lesson);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete lesson", description = "Delete a lesson (Admin only)")
    public ResponseEntity<Void> deleteLesson(@PathVariable String id) {
        lessonService.deleteLesson(id);
        return ResponseEntity.noContent().build();
    }
}
