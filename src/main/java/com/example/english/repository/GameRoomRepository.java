package com.example.english.repository;

import com.example.english.entity.GameRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GameRoomRepository extends JpaRepository<GameRoom, String> {
    List<GameRoom> findByGameGameIdOrderByCreatedAtDesc(String gameId);
    List<GameRoom> findByGameGameIdAndStatusOrderByCreatedAtDesc(String gameId, String status);
}




