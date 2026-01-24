package com.example.english.controller;

import com.example.english.entity.Game;
import com.example.english.entity.GameSession;
import com.example.english.exception.ResourceNotFoundException;
import com.example.english.service.GameService;
import com.example.english.service.RecommendationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/games")
@Tag(name = "Games", description = "Language learning games")
@SecurityRequirement(name = "bearerAuth")
public class GameController {

    @Autowired
    private GameService gameService;

    @Autowired
    private RecommendationService recommendationService;

    @Autowired
    private com.example.english.service.GameContentService gameContentService;

    @GetMapping
    @Operation(summary = "Get all games", description = "Get all available games")
    public ResponseEntity<List<Game>> getAllGames() {
        return ResponseEntity.ok(gameService.getAllGames());
    }

    @GetMapping("/level/{level}")
    @Operation(summary = "Get games by level", description = "Get games for a specific level")
    public ResponseEntity<List<Game>> getGamesByLevel(@PathVariable String level) {
        return ResponseEntity.ok(gameService.getGamesByLevel(level));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get game", description = "Get game by ID")
    public ResponseEntity<Game> getGame(@PathVariable String id) {
        return ResponseEntity.ok(gameService.getGameById(id));
    }

    @PostMapping("/users/{userId}/start/{gameId}")
    @Operation(summary = "Start game", description = "Start a game session for a user")
    public ResponseEntity<GameSession> startGame(
            @PathVariable String userId,
            @PathVariable String gameId) {
        GameSession session = gameService.startGame(userId, gameId);
        return new ResponseEntity<>(session, HttpStatus.CREATED);
    }

    @PostMapping("/sessions/{sessionId}/complete")
    @Operation(summary = "Complete game", description = "Complete a game session with score")
    public ResponseEntity<GameSession> completeGame(
            @PathVariable String sessionId,
            @RequestParam BigDecimal score) {
        return ResponseEntity.ok(gameService.completeGame(sessionId, score));
    }

    @GetMapping("/users/{userId}/sessions")
    @Operation(summary = "Get user game sessions", description = "Get all game sessions for a user")
    public ResponseEntity<List<GameSession>> getUserGameSessions(@PathVariable String userId) {
        return ResponseEntity.ok(gameService.getUserGameSessions(userId));
    }

    @GetMapping("/users/{userId}/recommended")
    @Operation(summary = "Get recommended games", description = "Get personalized game recommendations")
    public ResponseEntity<List<Game>> getRecommendedGames(@PathVariable String userId) {
        return ResponseEntity.ok(recommendationService.recommendGames(userId));
    }

    @PostMapping
    @Operation(summary = "Create game", description = "Create a new game (Admin only)")
    public ResponseEntity<Game> createGame(@RequestBody Game game) {
        Game created = gameService.createGame(game);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update game", description = "Update an existing game (Admin only)")
    public ResponseEntity<Game> updateGame(@PathVariable String id, @RequestBody Game game) {
        game.setGameId(id);
        Game updated = gameService.updateGame(game);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete game", description = "Delete a game (Admin only)")
    public ResponseEntity<Void> deleteGame(@PathVariable String id) {
        gameService.deleteGame(id);
        return ResponseEntity.noContent().build();
    }

    // ========== Game Content Endpoints ==========

    @GetMapping("/{gameId}/content")
    @Operation(summary = "Get game content", description = "Get content for a game based on its type")
    public ResponseEntity<?> getGameContent(@PathVariable String gameId) {
        try {
            Game game = gameService.getGameById(gameId);
            Object content = gameContentService.getGameContent(gameId, game.getGameType());
            return ResponseEntity.ok(content);
        } catch (ResourceNotFoundException e) {
            // Return empty list if game not found instead of 500 error
            return ResponseEntity.ok(java.util.Collections.emptyList());
        }
    }

    // Word Match Endpoints
    @PostMapping("/{gameId}/word-pairs")
    @Operation(summary = "Create word pair", description = "Add a word pair to a Word Match game")
    public ResponseEntity<com.example.english.entity.GameWordPair> createWordPair(
            @PathVariable String gameId,
            @RequestBody com.example.english.entity.GameWordPair wordPair) {
        return new ResponseEntity<>(gameContentService.createWordPair(gameId, wordPair), HttpStatus.CREATED);
    }

    @PutMapping("/word-pairs/{pairId}")
    @Operation(summary = "Update word pair", description = "Update an existing word pair")
    public ResponseEntity<com.example.english.entity.GameWordPair> updateWordPair(
            @PathVariable String pairId,
            @RequestBody com.example.english.entity.GameWordPair wordPair) {
        return ResponseEntity.ok(gameContentService.updateWordPair(pairId, wordPair));
    }

    @DeleteMapping("/word-pairs/{pairId}")
    @Operation(summary = "Delete word pair", description = "Delete a word pair")
    public ResponseEntity<Void> deleteWordPair(@PathVariable String pairId) {
        gameContentService.deleteWordPair(pairId);
        return ResponseEntity.noContent().build();
    }

    // Flashcard Endpoints
    @PostMapping("/{gameId}/flashcards")
    @Operation(summary = "Create flashcard", description = "Add a flashcard to a Flashcard game")
    public ResponseEntity<com.example.english.entity.GameFlashcard> createFlashcard(
            @PathVariable String gameId,
            @RequestBody com.example.english.entity.GameFlashcard flashcard) {
        return new ResponseEntity<>(gameContentService.createFlashcard(gameId, flashcard), HttpStatus.CREATED);
    }

    @PutMapping("/flashcards/{cardId}")
    @Operation(summary = "Update flashcard", description = "Update an existing flashcard")
    public ResponseEntity<com.example.english.entity.GameFlashcard> updateFlashcard(
            @PathVariable String cardId,
            @RequestBody com.example.english.entity.GameFlashcard flashcard) {
        return ResponseEntity.ok(gameContentService.updateFlashcard(cardId, flashcard));
    }

    @DeleteMapping("/flashcards/{cardId}")
    @Operation(summary = "Delete flashcard", description = "Delete a flashcard")
    public ResponseEntity<Void> deleteFlashcard(@PathVariable String cardId) {
        gameContentService.deleteFlashcard(cardId);
        return ResponseEntity.noContent().build();
    }

    // Spelling Endpoints
    @PostMapping("/{gameId}/spelling-words")
    @Operation(summary = "Create spelling word", description = "Add a word to a Spelling game")
    public ResponseEntity<com.example.english.entity.GameSpellingWord> createSpellingWord(
            @PathVariable String gameId,
            @RequestBody com.example.english.entity.GameSpellingWord spellingWord) {
        return new ResponseEntity<>(gameContentService.createSpellingWord(gameId, spellingWord), HttpStatus.CREATED);
    }

    @PutMapping("/spelling-words/{wordId}")
    @Operation(summary = "Update spelling word", description = "Update an existing spelling word")
    public ResponseEntity<com.example.english.entity.GameSpellingWord> updateSpellingWord(
            @PathVariable String wordId,
            @RequestBody com.example.english.entity.GameSpellingWord spellingWord) {
        return ResponseEntity.ok(gameContentService.updateSpellingWord(wordId, spellingWord));
    }

    @DeleteMapping("/spelling-words/{wordId}")
    @Operation(summary = "Delete spelling word", description = "Delete a spelling word")
    public ResponseEntity<Void> deleteSpellingWord(@PathVariable String wordId) {
        gameContentService.deleteSpellingWord(wordId);
        return ResponseEntity.noContent().build();
    }

    // Quiz Endpoints
    @PostMapping("/{gameId}/quiz-questions")
    @Operation(summary = "Create quiz question", description = "Add a question to a Quiz game")
    public ResponseEntity<com.example.english.entity.GameQuizQuestion> createQuizQuestion(
            @PathVariable String gameId,
            @RequestBody com.example.english.entity.GameQuizQuestion quizQuestion) {
        return new ResponseEntity<>(gameContentService.createQuizQuestion(gameId, quizQuestion), HttpStatus.CREATED);
    }

    @PutMapping("/quiz-questions/{questionId}")
    @Operation(summary = "Update quiz question", description = "Update an existing quiz question")
    public ResponseEntity<com.example.english.entity.GameQuizQuestion> updateQuizQuestion(
            @PathVariable String questionId,
            @RequestBody com.example.english.entity.GameQuizQuestion quizQuestion) {
        return ResponseEntity.ok(gameContentService.updateQuizQuestion(questionId, quizQuestion));
    }

    @DeleteMapping("/quiz-questions/{questionId}")
    @Operation(summary = "Delete quiz question", description = "Delete a quiz question")
    public ResponseEntity<Void> deleteQuizQuestion(@PathVariable String questionId) {
        gameContentService.deleteQuizQuestion(questionId);
        return ResponseEntity.noContent().build();
    }

    // Puzzle Endpoints
    @PostMapping("/{gameId}/puzzles")
    @Operation(summary = "Create puzzle", description = "Add a puzzle to a Puzzle game")
    public ResponseEntity<com.example.english.entity.GamePuzzle> createPuzzle(
            @PathVariable String gameId,
            @RequestBody com.example.english.entity.GamePuzzle puzzle) {
        return new ResponseEntity<>(gameContentService.createPuzzle(gameId, puzzle), HttpStatus.CREATED);
    }

    @PutMapping("/puzzles/{puzzleId}")
    @Operation(summary = "Update puzzle", description = "Update an existing puzzle")
    public ResponseEntity<com.example.english.entity.GamePuzzle> updatePuzzle(
            @PathVariable String puzzleId,
            @RequestBody com.example.english.entity.GamePuzzle puzzle) {
        return ResponseEntity.ok(gameContentService.updatePuzzle(puzzleId, puzzle));
    }

    @DeleteMapping("/puzzles/{puzzleId}")
    @Operation(summary = "Delete puzzle", description = "Delete a puzzle")
    public ResponseEntity<Void> deletePuzzle(@PathVariable String puzzleId) {
        gameContentService.deletePuzzle(puzzleId);
        return ResponseEntity.noContent().build();
    }
}
