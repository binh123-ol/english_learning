package com.example.english.repository;

import com.example.english.entity.GameSpellingWord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GameSpellingWordRepository extends JpaRepository<GameSpellingWord, String> {
    List<GameSpellingWord> findByGame_GameId(String gameId);
    void deleteByGame_GameId(String gameId);
}
