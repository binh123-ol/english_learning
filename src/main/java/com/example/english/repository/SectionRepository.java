package com.example.english.repository;

import com.example.english.entity.Section;
import com.example.english.entity.Exam;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SectionRepository extends JpaRepository<Section, String> {
    List<Section> findByExam(Exam exam);
    List<Section> findByExamOrderByOrderIndexAsc(Exam exam);
}
