package com.example.english.repository;

import com.example.english.entity.GamePuzzle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GamePuzzleRepository extends JpaRepository<GamePuzzle, String> {
    List<GamePuzzle> findByGame_GameId(String gameId);
    void deleteByGame_GameId(String gameId);
}
