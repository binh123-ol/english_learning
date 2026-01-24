package com.example.english.service;

import com.example.english.entity.ExerciseOption;
import com.example.english.entity.LessonExercise;
import com.example.english.entity.SubLesson;
import com.example.english.exception.ResourceNotFoundException;
import com.example.english.repository.ExerciseOptionRepository;
import com.example.english.repository.LessonExerciseRepository;
import com.example.english.repository.SubLessonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class LessonExerciseService {

    @Autowired
    private LessonExerciseRepository exerciseRepository;

    @Autowired
    private ExerciseOptionRepository optionRepository;

    @Autowired
    private SubLessonRepository subLessonRepository;

    public List<LessonExercise> getExercisesBySubLessonId(String subLessonId) {
        List<LessonExercise> exercises = exerciseRepository.findBySubLessonSubLessonIdOrderByOrderIndexAsc(subLessonId);
        
        // Fetch options for each exercise
        for (LessonExercise exercise : exercises) {
            if (exercise.getExerciseType() != null && exercise.getExerciseType().equals("MULTIPLE_CHOICE")) {
                List<ExerciseOption> options = optionRepository.findByExerciseExerciseIdOrderByOrderIndexAsc(exercise.getExerciseId());
                exercise.setOptions(options);
            }
        }
        
        return exercises;
    }

    public LessonExercise getExerciseById(String exerciseId) {
        return exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new ResourceNotFoundException("LessonExercise", "id", exerciseId));
    }

    @Transactional
    public LessonExercise createExercise(String subLessonId, LessonExercise exercise) {
        System.out.println("=== CREATE EXERCISE START ===");
        System.out.println("SubLessonId: " + subLessonId);
        System.out.println("Exercise Title: " + exercise.getTitle());
        System.out.println("Exercise Type: " + exercise.getExerciseType());
        
        SubLesson subLesson = subLessonRepository.findById(subLessonId)
                .orElseThrow(() -> new ResourceNotFoundException("SubLesson", "id", subLessonId));
        System.out.println("Found SubLesson: " + subLesson.getTitle());

        // Detach options to prevent cascade issues, we will save them manually
        List<ExerciseOption> options = exercise.getOptions();
        System.out.println("Number of options: " + (options != null ? options.size() : 0));
        exercise.setOptions(null);

        exercise.setExerciseId(UUID.randomUUID().toString());
        exercise.setSubLesson(subLesson);
        exercise.setCreatedAt(LocalDateTime.now());
        if (exercise.getIsActive() == null) {
            exercise.setIsActive(true);
        }

        System.out.println("Saving exercise to database...");
        LessonExercise saved = exerciseRepository.save(exercise);
        exerciseRepository.flush(); // Force database write
        System.out.println("Exercise saved and flushed with ID: " + saved.getExerciseId());

        // Save options if it's MULTIPLE_CHOICE
        if (saved.getExerciseType() != null && saved.getExerciseType().equals("MULTIPLE_CHOICE")) {
            if (options != null && !options.isEmpty()) {
                System.out.println("Saving " + options.size() + " options...");
                for (ExerciseOption option : options) {
                    option.setOptionId(UUID.randomUUID().toString());
                    option.setExercise(saved);
                    optionRepository.save(option);
                    System.out.println("Saved option: " + option.getOptionText());
                }
                optionRepository.flush(); // Force database write for options
                System.out.println("Options flushed to database");
                
                // Fetch and set the saved options back to the exercise
                List<ExerciseOption> savedOptions = optionRepository.findByExerciseExerciseIdOrderByOrderIndexAsc(saved.getExerciseId());
                saved.setOptions(savedOptions);
                System.out.println("Fetched " + savedOptions.size() + " saved options");
            }
        }

        System.out.println("=== CREATE EXERCISE END ===");
        return saved;
    }

    @Transactional
    public LessonExercise updateExercise(String exerciseId, LessonExercise exercise) {
        LessonExercise existing = getExerciseById(exerciseId);
        existing.setExerciseType(exercise.getExerciseType());
        existing.setTitle(exercise.getTitle());
        existing.setQuestionText(exercise.getQuestionText());
        existing.setCorrectAnswer(exercise.getCorrectAnswer());
        existing.setScorePoints(exercise.getScorePoints());
        existing.setOrderIndex(exercise.getOrderIndex());
        existing.setIsActive(exercise.getIsActive());

        // Update options for MULTIPLE_CHOICE
        if (exercise.getExerciseType() != null && exercise.getExerciseType().equals("MULTIPLE_CHOICE")) {
            // Delete existing options
            optionRepository.findByExerciseExerciseIdOrderByOrderIndexAsc(exerciseId)
                    .forEach(optionRepository::delete);

            // Add new options
            if (exercise.getOptions() != null && !exercise.getOptions().isEmpty()) {
                for (ExerciseOption option : exercise.getOptions()) {
                    option.setOptionId(UUID.randomUUID().toString());
                    option.setExercise(existing);
                    optionRepository.save(option);
                }
            }
        }

        return exerciseRepository.save(existing);
    }

    @Transactional
    public void deleteExercise(String exerciseId) {
        LessonExercise exercise = getExerciseById(exerciseId);
        exerciseRepository.delete(exercise);
    }

    public List<ExerciseOption> getOptionsByExerciseId(String exerciseId) {
        return optionRepository.findByExerciseExerciseIdOrderByOrderIndexAsc(exerciseId);
    }
}
