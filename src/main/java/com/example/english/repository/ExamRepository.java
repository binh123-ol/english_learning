package com.example.english.repository;

import com.example.english.entity.Exam;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExamRepository extends JpaRepository<Exam, String> {
    // Custom queries if needed
}