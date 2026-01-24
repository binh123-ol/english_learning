package com.example.english.repository;

import com.example.english.entity.ExerciseOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExerciseOptionRepository extends JpaRepository<ExerciseOption, String> {
    List<ExerciseOption> findByExerciseExerciseIdOrderByOrderIndexAsc(String exerciseId);
}




