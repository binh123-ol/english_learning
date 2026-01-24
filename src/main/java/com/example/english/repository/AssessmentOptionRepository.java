package com.example.english.repository;

import com.example.english.entity.AssessmentOption;
import com.example.english.entity.AssessmentQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssessmentOptionRepository extends JpaRepository<AssessmentOption, String> {
    List<AssessmentOption> findByQuestionOrderByOrderIndexAsc(AssessmentQuestion question);
}






