package com.example.english.repository;

import com.example.english.entity.GameFlashcard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GameFlashcardRepository extends JpaRepository<GameFlashcard, String> {
    List<GameFlashcard> findByGame_GameIdOrderByDisplayOrderAsc(String gameId);
    void deleteByGame_GameId(String gameId);
}
