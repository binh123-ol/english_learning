package com.example.english.repository;

import com.example.english.entity.WritingEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WritingEvaluationRepository extends JpaRepository<WritingEvaluation, String> {
    List<WritingEvaluation> findByUser_UserIdOrderByCreatedAtDesc(String userId);
}
