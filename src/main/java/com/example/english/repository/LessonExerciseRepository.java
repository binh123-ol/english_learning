package com.example.english.repository;

import com.example.english.entity.LessonExercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonExerciseRepository extends JpaRepository<LessonExercise, String> {
    List<LessonExercise> findBySubLessonSubLessonIdOrderByOrderIndexAsc(String subLessonId);
    List<LessonExercise> findBySubLessonSubLessonIdAndIsActiveTrueOrderByOrderIndexAsc(String subLessonId);
}




