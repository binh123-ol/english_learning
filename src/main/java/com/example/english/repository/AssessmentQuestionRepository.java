package com.example.english.repository;

import com.example.english.entity.AssessmentQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssessmentQuestionRepository extends JpaRepository<AssessmentQuestion, String> {
    List<AssessmentQuestion> findBySkillTypeOrderByOrderIndexAsc(String skillType);
    List<AssessmentQuestion> findBySkillTypeAndDifficultyLevelOrderByOrderIndexAsc(String skillType, String difficultyLevel);
}






