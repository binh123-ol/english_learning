package com.example.english.controller;

import com.example.english.entity.GameRoom;
import com.example.english.entity.RoomPlayer;
import com.example.english.service.GameRoomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/games")
@Tag(name = "Game Rooms", description = "Game room management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class GameRoomController {

    @Autowired
    private GameRoomService gameRoomService;

    @GetMapping("/{gameId}/rooms")
    @Operation(summary = "Get all rooms for a game")
    public ResponseEntity<List<GameRoom>> getRoomsByGameId(@PathVariable String gameId) {
        List<GameRoom> rooms = gameRoomService.getRoomsByGameId(gameId);
        return ResponseEntity.ok(rooms);
    }

    @GetMapping("/rooms/{roomId}")
    @Operation(summary = "Get room by ID")
    public ResponseEntity<GameRoom> getRoomById(@PathVariable String roomId) {
        GameRoom room = gameRoomService.getRoomById(roomId);
        return ResponseEntity.ok(room);
    }

    @PostMapping("/{gameId}/rooms")
    @Operation(summary = "Create a new room")
    public ResponseEntity<GameRoom> createRoom(@PathVariable String gameId, @RequestBody GameRoom room) {
        GameRoom created = gameRoomService.createRoom(gameId, room);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/rooms/{roomId}")
    @Operation(summary = "Update a room")
    public ResponseEntity<GameRoom> updateRoom(@PathVariable String roomId, @RequestBody GameRoom room) {
        GameRoom updated = gameRoomService.updateRoom(roomId, room);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/rooms/{roomId}")
    @Operation(summary = "Delete a room")
    public ResponseEntity<Void> deleteRoom(@PathVariable String roomId) {
        gameRoomService.deleteRoom(roomId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/rooms/{roomId}/players")
    @Operation(summary = "Get all players in a room with rankings")
    public ResponseEntity<List<RoomPlayer>> getPlayersByRoomId(@PathVariable String roomId) {
        List<RoomPlayer> players = gameRoomService.getPlayersByRoomId(roomId);
        return ResponseEntity.ok(players);
    }

    @PostMapping("/rooms/{roomId}/calculate-rankings")
    @Operation(summary = "Calculate and update rankings for a room")
    public ResponseEntity<Void> calculateRankings(@PathVariable String roomId) {
        gameRoomService.calculateRankings(roomId);
        return ResponseEntity.ok().build();
    }
}




