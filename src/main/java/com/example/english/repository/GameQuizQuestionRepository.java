package com.example.english.repository;

import com.example.english.entity.GameQuizQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GameQuizQuestionRepository extends JpaRepository<GameQuizQuestion, String> {
    List<GameQuizQuestion> findByGame_GameId(String gameId);
    void deleteByGame_GameId(String gameId);
}
