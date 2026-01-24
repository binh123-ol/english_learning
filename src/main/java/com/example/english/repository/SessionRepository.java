package com.example.english.repository;

import com.example.english.entity.Session;
import com.example.english.entity.Exam;
import com.example.english.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SessionRepository extends JpaRepository<Session, String> {
    List<Session> findByExam(Exam exam);
    List<Session> findByExamOrderByFinishedAtDesc(Exam exam);
    List<Session> findByUserOrderByStartedAtDesc(User user);
}
