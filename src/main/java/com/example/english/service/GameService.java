package com.example.english.service;

import com.example.english.entity.*;
import com.example.english.exception.ResourceNotFoundException;
import com.example.english.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class GameService {

    @Autowired
    private GameRepository gameRepository;

    @Autowired
    private GameSessionRepository gameSessionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserProgressRepository progressRepository;

    @Autowired
    private AnalyticsService analyticsService;

    public List<Game> getAllGames() {
        return gameRepository.findAll();
    }

    public List<Game> getGamesByLevel(String level) {
        return gameRepository.findByLevelAndIsActiveTrue(level);
    }

    public Game getGameById(String id) {
        return gameRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Game", "id", id));
    }

    @Transactional
    public GameSession startGame(String userId, String gameId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        Game game = getGameById(gameId);

        GameSession session = new GameSession();
        session.setGameSessionId(UUID.randomUUID().toString());
        session.setUser(user);
        session.setGame(game);
        session.setCompleted(false);
        session.setXpEarned(0);
        session.setStartedAt(LocalDateTime.now());

        return gameSessionRepository.save(session);
    }

    @Transactional
    public GameSession completeGame(String gameSessionId, BigDecimal score) {
        GameSession session = gameSessionRepository.findById(gameSessionId)
                .orElseThrow(() -> new ResourceNotFoundException("GameSession", "id", gameSessionId));

        if (session.getCompleted()) {
            return session;
        }

        session.setScore(score);
        session.setCompleted(true);
        session.setCompletedAt(LocalDateTime.now());

        // Calculate XP based on score (score out of 100)
        Game game = session.getGame();
        double scoreValue = score.doubleValue();
        int xpEarned = (int) (game.getXpReward() * (scoreValue / 100.0));
        session.setXpEarned(xpEarned);

        // Update user progress
        User user = session.getUser();
        List<UserProgress> existingProgressList = progressRepository.findByUserAndReferenceIdAndProgressType(
                user, game.getGameId(), "GAME");

        UserProgress progress;
        if (!existingProgressList.isEmpty()) {
            progress = existingProgressList.get(0);
        } else {
            progress = new UserProgress();
            progress.setProgressId(UUID.randomUUID().toString());
            progress.setUser(user);
            progress.setProgressType("GAME");
            progress.setReferenceId(game.getGameId());
            progress.setCreatedAt(LocalDateTime.now());
        }

        progress.setStatus("COMPLETED");
        progress.setProgressPercentage(100);
        progress.setXpEarned(xpEarned);
        progress.setCompletedAt(LocalDateTime.now());
        progress.setLastAccessedAt(LocalDateTime.now());

        progressRepository.save(progress);

        // Update analytics
        Integer estimatedTime = game.getEstimatedDurationMinutes() != null
                ? game.getEstimatedDurationMinutes()
                : 10;
        analyticsService.updateDailyStatistics(user.getUserId(), "GAME", xpEarned, estimatedTime);

        return gameSessionRepository.save(session);
    }

    public List<GameSession> getUserGameSessions(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return gameSessionRepository.findByUser(user);
    }

    @Transactional
    public Game createGame(Game game) {
        game.setGameId(UUID.randomUUID().toString());
        game.setCreatedAt(LocalDateTime.now());
        return gameRepository.save(game);
    }

    @Transactional
    public Game updateGame(Game game) {
        Game existing = getGameById(game.getGameId());
        existing.setTitle(game.getTitle());
        existing.setGameType(game.getGameType());
        existing.setLevel(game.getLevel());
        existing.setDescription(game.getDescription());
        existing.setXpReward(game.getXpReward());
        existing.setDifficultyLevel(game.getDifficultyLevel());
        existing.setEstimatedDurationMinutes(game.getEstimatedDurationMinutes());
        existing.setIsActive(game.getIsActive());
        return gameRepository.save(existing);
    }

    @Transactional
    public void deleteGame(String id) {
        Game game = getGameById(id);
        gameRepository.delete(game);
    }
}
