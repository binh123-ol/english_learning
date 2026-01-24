package com.example.english.service;

import com.example.english.entity.Game;
import com.example.english.entity.GameRoom;
import com.example.english.entity.RoomPlayer;
import com.example.english.exception.ResourceNotFoundException;
import com.example.english.repository.GameRepository;
import com.example.english.repository.GameRoomRepository;
import com.example.english.repository.RoomPlayerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class GameRoomService {

    @Autowired
    private GameRoomRepository gameRoomRepository;

    @Autowired
    private RoomPlayerRepository roomPlayerRepository;

    @Autowired
    private GameRepository gameRepository;

    public List<GameRoom> getRoomsByGameId(String gameId) {
        return gameRoomRepository.findByGameGameIdOrderByCreatedAtDesc(gameId);
    }

    public GameRoom getRoomById(String roomId) {
        return gameRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("GameRoom", "id", roomId));
    }

    @Transactional
    public GameRoom createRoom(String gameId, GameRoom room) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new ResourceNotFoundException("Game", "id", gameId));

        room.setRoomId(UUID.randomUUID().toString());
        room.setGame(game);
        room.setStatus("WAITING");
        room.setCurrentPlayers(0);
        room.setCreatedAt(LocalDateTime.now());
        if (room.getMaxPlayers() == null) {
            room.setMaxPlayers(4);
        }

        return gameRoomRepository.save(room);
    }

    @Transactional
    public GameRoom updateRoom(String roomId, GameRoom room) {
        GameRoom existing = getRoomById(roomId);
        existing.setRoomName(room.getRoomName());
        existing.setMaxPlayers(room.getMaxPlayers());
        existing.setStatus(room.getStatus());
        existing.setGameConfig(room.getGameConfig());
        return gameRoomRepository.save(existing);
    }

    @Transactional
    public void deleteRoom(String roomId) {
        GameRoom room = getRoomById(roomId);
        gameRoomRepository.delete(room);
    }

    public List<RoomPlayer> getPlayersByRoomId(String roomId) {
        List<RoomPlayer> players = roomPlayerRepository.findByRoomRoomIdOrderByRankPositionAsc(roomId);
        
        // If no ranks assigned, calculate them
        if (players.stream().anyMatch(p -> p.getRankPosition() == null)) {
            calculateRankings(roomId);
            players = roomPlayerRepository.findByRoomRoomIdOrderByRankPositionAsc(roomId);
        }
        
        return players;
    }

    @Transactional
    public void calculateRankings(String roomId) {
        List<RoomPlayer> players = roomPlayerRepository.findByRoomRoomId(roomId);
        
        // Sort by: 1) completion time (lower is better), 2) mistakes (lower is better), 3) score (higher is better)
        players.sort((p1, p2) -> {
            // Compare completion time (lower is better)
            Integer time1 = p1.getCompletionTimeSeconds() != null ? p1.getCompletionTimeSeconds() : Integer.MAX_VALUE;
            Integer time2 = p2.getCompletionTimeSeconds() != null ? p2.getCompletionTimeSeconds() : Integer.MAX_VALUE;
            int timeCompare = Integer.compare(time1, time2);
            if (timeCompare != 0) return timeCompare;
            
            // Compare mistakes (lower is better)
            int mistakesCompare = Integer.compare(p1.getMistakesCount(), p2.getMistakesCount());
            if (mistakesCompare != 0) return mistakesCompare;
            
            // Compare score (higher is better)
            return p2.getScore().compareTo(p1.getScore());
        });
        
        // Assign ranks
        for (int i = 0; i < players.size(); i++) {
            players.get(i).setRankPosition(i + 1);
            roomPlayerRepository.save(players.get(i));
        }
    }
}

