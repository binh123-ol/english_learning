package com.example.english.repository;

import com.example.english.entity.LevelAssessment;
import com.example.english.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LevelAssessmentRepository extends JpaRepository<LevelAssessment, String> {
    List<LevelAssessment> findByUser(User user);
    Optional<LevelAssessment> findFirstByUserOrderByCompletedAtDesc(User user);
}


