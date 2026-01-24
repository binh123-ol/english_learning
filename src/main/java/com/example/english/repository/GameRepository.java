package com.example.english.repository;

import com.example.english.entity.Game;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GameRepository extends JpaRepository<Game, String> {
    List<Game> findByLevel(String level);
    List<Game> findByGameType(String gameType);
    List<Game> findByIsActiveTrue();
    List<Game> findByLevelAndIsActiveTrue(String level);
}


