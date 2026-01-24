package com.example.english.repository;

import com.example.english.entity.UserAnswer;
import com.example.english.entity.Session;
import com.example.english.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserAnswerRepository extends JpaRepository<UserAnswer, String> {
    boolean existsBySessionAndQuestion(Session session, Question question);
    List<UserAnswer> findBySession(Session session);
}
