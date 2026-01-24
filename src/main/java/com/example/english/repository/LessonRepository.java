package com.example.english.repository;

import com.example.english.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LessonRepository extends JpaRepository<Lesson, String> {
    List<Lesson> findByLevel(String level);
    List<Lesson> findByLessonType(String lessonType);
    List<Lesson> findByLevelAndLessonType(String level, String lessonType);
    List<Lesson> findByIsActiveTrue();
    List<Lesson> findByLevelAndIsActiveTrue(String level);
}


