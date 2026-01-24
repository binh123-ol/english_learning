package com.example.english.repository;

import com.example.english.entity.LearningPath;
import com.example.english.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LearningPathRepository extends JpaRepository<LearningPath, String> {
    List<LearningPath> findByUser(User user);
    List<LearningPath> findByUserAndStatus(User user, String status);
    Optional<LearningPath> findByUserAndLesson(User user, com.example.english.entity.Lesson lesson);
    List<LearningPath> findByUserOrderByRecommendedOrderAsc(User user);
}


