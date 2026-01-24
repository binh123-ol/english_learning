package com.example.english.repository;

import com.example.english.entity.Question;
import com.example.english.entity.Section;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, String> {
    List<Question> findBySection(Section section);
}
