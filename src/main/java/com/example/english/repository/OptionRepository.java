package com.example.english.repository;

import com.example.english.entity.Option;
import com.example.english.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OptionRepository extends JpaRepository<Option, String> {
    List<Option> findByQuestion(Question question);
}
