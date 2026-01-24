package com.example.english.repository;

import com.example.english.entity.GameWordPair;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GameWordPairRepository extends JpaRepository<GameWordPair, String> {
    List<GameWordPair> findByGame_GameIdOrderByDisplayOrderAsc(String gameId);
    void deleteByGame_GameId(String gameId);
}
