package com.example.english.repository;

import com.example.english.entity.GameSession;
import com.example.english.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GameSessionRepository extends JpaRepository<GameSession, String> {
    List<GameSession> findByUser(User user);
    List<GameSession> findByUserAndCompleted(User user, Boolean completed);
}


