package com.example.english.controller;

import com.example.english.entity.ExerciseOption;
import com.example.english.entity.LessonExercise;
import com.example.english.service.LessonExerciseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sub-lessons")
@Tag(name = "Lesson Exercises", description = "Lesson exercise management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class LessonExerciseController {

    @Autowired
    private LessonExerciseService exerciseService;

    @GetMapping("/{subLessonId}/exercises")
    @Operation(summary = "Get all exercises for a sub-lesson")
    public ResponseEntity<List<LessonExercise>> getExercisesBySubLessonId(@PathVariable String subLessonId) {
        List<LessonExercise> exercises = exerciseService.getExercisesBySubLessonId(subLessonId);
        return ResponseEntity.ok(exercises);
    }

    @GetMapping("/exercises/{exerciseId}")
    @Operation(summary = "Get exercise by ID")
    public ResponseEntity<LessonExercise> getExerciseById(@PathVariable String exerciseId) {
        LessonExercise exercise = exerciseService.getExerciseById(exerciseId);
        return ResponseEntity.ok(exercise);
    }

    @GetMapping("/exercises/{exerciseId}/options")
    @Operation(summary = "Get all options for an exercise")
    public ResponseEntity<List<ExerciseOption>> getOptionsByExerciseId(@PathVariable String exerciseId) {
        List<ExerciseOption> options = exerciseService.getOptionsByExerciseId(exerciseId);
        return ResponseEntity.ok(options);
    }

    @PostMapping("/{subLessonId}/exercises")
    @Operation(summary = "Create a new exercise")
    public ResponseEntity<LessonExercise> createExercise(@PathVariable String subLessonId, @RequestBody LessonExercise exercise) {
        LessonExercise created = exerciseService.createExercise(subLessonId, exercise);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/exercises/{exerciseId}")
    @Operation(summary = "Update an exercise")
    public ResponseEntity<LessonExercise> updateExercise(@PathVariable String exerciseId, @RequestBody LessonExercise exercise) {
        LessonExercise updated = exerciseService.updateExercise(exerciseId, exercise);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/exercises/{exerciseId}")
    @Operation(summary = "Delete an exercise")
    public ResponseEntity<Void> deleteExercise(@PathVariable String exerciseId) {
        exerciseService.deleteExercise(exerciseId);
        return ResponseEntity.noContent().build();
    }
}

