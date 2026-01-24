package com.example.english.repository;

import com.example.english.entity.RoomPlayer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomPlayerRepository extends JpaRepository<RoomPlayer, String> {
    List<RoomPlayer> findByRoomRoomIdOrderByRankPositionAsc(String roomId);
    List<RoomPlayer> findByRoomRoomId(String roomId);
    Optional<RoomPlayer> findByRoomRoomIdAndUserUserId(String roomId, String userId);
    int countByRoomRoomId(String roomId);
}

