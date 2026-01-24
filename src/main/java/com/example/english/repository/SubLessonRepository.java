package com.example.english.repository;

import com.example.english.entity.SubLesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubLessonRepository extends JpaRepository<SubLesson, String> {
    List<SubLesson> findByLessonLessonIdOrderByOrderIndexAsc(String lessonId);
    List<SubLesson> findByLessonLessonIdAndIsActiveTrueOrderByOrderIndexAsc(String lessonId);
}




