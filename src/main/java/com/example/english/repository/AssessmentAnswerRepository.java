package com.example.english.repository;

import com.example.english.entity.AssessmentAnswer;
import com.example.english.entity.LevelAssessment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssessmentAnswerRepository extends JpaRepository<AssessmentAnswer, String> {
    List<AssessmentAnswer> findByAssessment(LevelAssessment assessment);
    List<AssessmentAnswer> findByAssessmentAndQuestionSkillType(LevelAssessment assessment, String skillType);
}






