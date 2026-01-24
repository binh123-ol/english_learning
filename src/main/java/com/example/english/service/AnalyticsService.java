package com.example.english.service;

import com.example.english.entity.*;
import com.example.english.exception.ResourceNotFoundException;
import com.example.english.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LearningStatisticRepository statisticRepository;

    @Autowired
    private UserProgressRepository progressRepository;

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private GameSessionRepository gameSessionRepository;

    @Autowired
    private ConversationRepository conversationRepository;

    /**
     * Get learning statistics for a user
     */
    public Map<String, Object> getUserStatistics(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Map<String, Object> stats = new HashMap<>();

        // Get today's statistics
        LearningStatistic todayStat = getOrCreateTodayStatistic(user);
        stats.put("today", todayStat);

        // Get weekly statistics
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(7);
        List<LearningStatistic> weeklyStats = statisticRepository.findByUserAndStatDateBetween(user, startDate,
                endDate);
        stats.put("weekly", calculateWeeklyStatistics(weeklyStats));

        // Get monthly statistics
        startDate = endDate.minusDays(30);
        List<LearningStatistic> monthlyStats = statisticRepository.findByUserAndStatDateBetween(user, startDate,
                endDate);
        stats.put("monthly", calculateMonthlyStatistics(monthlyStats));

        // Get overall progress
        stats.put("overall", calculateOverallProgress(user));

        return stats;
    }

    /**
     * Get or create today's learning statistic
     */
    @Transactional
    public LearningStatistic getOrCreateTodayStatistic(User user) {
        LocalDate today = LocalDate.now();
        Optional<LearningStatistic> todayStat = statisticRepository.findByUserAndStatDate(user, today);

        if (todayStat.isPresent()) {
            return todayStat.get();
        }

        // Create new statistic for today
        LearningStatistic statistic = new LearningStatistic();
        statistic.setStatisticId(UUID.randomUUID().toString());
        statistic.setUser(user);
        statistic.setStatDate(today);
        statistic.setCreatedAt(LocalDateTime.now());

        return statisticRepository.save(statistic);
    }

    /**
     * Update daily statistics after completing an activity
     */
    @Transactional
    public void updateDailyStatistics(String userId, String activityType, Integer xpEarned, Integer timeMinutes) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        LearningStatistic todayStat = getOrCreateTodayStatistic(user);

        switch (activityType) {
            case "LESSON":
                todayStat.setLessonsCompleted(
                        (todayStat.getLessonsCompleted() != null ? todayStat.getLessonsCompleted() : 0) + 1);
                break;
            case "GAME":
                todayStat.setGamesCompleted(
                        (todayStat.getGamesCompleted() != null ? todayStat.getGamesCompleted() : 0) + 1);
                break;
            case "CONVERSATION":
                todayStat.setConversationsCompleted(
                        (todayStat.getConversationsCompleted() != null ? todayStat.getConversationsCompleted() : 0)
                                + 1);
                break;
            case "EXAM":
                todayStat.setExamsCompleted(
                        (todayStat.getExamsCompleted() != null ? todayStat.getExamsCompleted() : 0) + 1);
                break;
        }

        todayStat.setXpEarned(
                (todayStat.getXpEarned() != null ? todayStat.getXpEarned() : 0) + (xpEarned != null ? xpEarned : 0));
        todayStat.setTotalTimeMinutes((todayStat.getTotalTimeMinutes() != null ? todayStat.getTotalTimeMinutes() : 0)
                + (timeMinutes != null ? timeMinutes : 0));

        statisticRepository.save(todayStat);

        // Update user's total XP and learning streak
        updateUserProgress(user, xpEarned);
    }

    /**
     * Update user's progress and learning streak
     */
    @Transactional
    private void updateUserProgress(User user, Integer xpEarned) {
        user.setTotalXP((user.getTotalXP() != null ? user.getTotalXP() : 0) + (xpEarned != null ? xpEarned : 0));

        // Update learning streak
        LocalDate today = LocalDate.now();
        LocalDate lastActivity = user.getLastActivityDate() != null
                ? user.getLastActivityDate().toLocalDate()
                : null;

        if (lastActivity == null || lastActivity.isBefore(today.minusDays(1))) {
            // New day - check if streak continues
            if (lastActivity != null && lastActivity.equals(today.minusDays(1))) {
                // Continue streak
                user.setLearningStreak(user.getLearningStreak() + 1);
            } else {
                // Reset streak or start new one
                user.setLearningStreak(1);
            }
        } else if (lastActivity.equals(today)) {
            // Same day - don't update streak
        }

        user.setLastActivityDate(LocalDateTime.now());
        userRepository.save(user);
    }

    /**
     * Calculate weekly statistics
     */
    private Map<String, Object> calculateWeeklyStatistics(List<LearningStatistic> stats) {
        Map<String, Object> weekly = new HashMap<>();

        int totalLessons = stats.stream().mapToInt(LearningStatistic::getLessonsCompleted).sum();
        int totalGames = stats.stream().mapToInt(LearningStatistic::getGamesCompleted).sum();
        int totalConversations = stats.stream().mapToInt(LearningStatistic::getConversationsCompleted).sum();
        int totalTime = stats.stream().mapToInt(LearningStatistic::getTotalTimeMinutes).sum();
        int totalXP = stats.stream().mapToInt(LearningStatistic::getXpEarned).sum();

        weekly.put("lessonsCompleted", totalLessons);
        weekly.put("gamesCompleted", totalGames);
        weekly.put("conversationsCompleted", totalConversations);
        weekly.put("totalTimeMinutes", totalTime);
        weekly.put("totalXP", totalXP);
        weekly.put("averageTimePerDay", stats.isEmpty() ? 0 : totalTime / stats.size());

        return weekly;
    }

    /**
     * Calculate monthly statistics
     */
    private Map<String, Object> calculateMonthlyStatistics(List<LearningStatistic> stats) {
        Map<String, Object> monthly = new HashMap<>();

        int totalLessons = stats.stream().mapToInt(LearningStatistic::getLessonsCompleted).sum();
        int totalGames = stats.stream().mapToInt(LearningStatistic::getGamesCompleted).sum();
        int totalConversations = stats.stream().mapToInt(LearningStatistic::getConversationsCompleted).sum();
        int totalTime = stats.stream().mapToInt(LearningStatistic::getTotalTimeMinutes).sum();
        int totalXP = stats.stream().mapToInt(LearningStatistic::getXpEarned).sum();

        monthly.put("lessonsCompleted", totalLessons);
        monthly.put("gamesCompleted", totalGames);
        monthly.put("conversationsCompleted", totalConversations);
        monthly.put("totalTimeMinutes", totalTime);
        monthly.put("totalXP", totalXP);
        monthly.put("averageTimePerDay", stats.isEmpty() ? 0 : totalTime / stats.size());

        return monthly;
    }

    /**
     * Calculate overall progress
     */
    private Map<String, Object> calculateOverallProgress(User user) {
        Map<String, Object> overall = new HashMap<>();

        // Get all user progress
        List<UserProgress> allProgress = progressRepository.findByUser(user);
        List<UserProgress> completedProgress = progressRepository.findByUserAndStatus(user, "COMPLETED");

        overall.put("totalActivities", allProgress.size());
        overall.put("completedActivities", completedProgress.size());
        overall.put("completionRate", allProgress.isEmpty() ? 0.0
                : (double) completedProgress.size() / allProgress.size() * 100);
        overall.put("totalXP", user.getTotalXP());
        overall.put("learningStreak", user.getLearningStreak());
        overall.put("currentLevel", user.getCurrentLevel());
        overall.put("levelTarget", user.getLevelTarget());

        // Calculate progress by type
        Map<String, Long> progressByType = completedProgress.stream()
                .collect(Collectors.groupingBy(UserProgress::getProgressType, Collectors.counting()));
        overall.put("progressByType", progressByType);

        return overall;
    }

    /**
     * Get progress report for user
     */
    public Map<String, Object> getProgressReport(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Map<String, Object> report = new HashMap<>();
        report.put("user", user);
        report.put("statistics", getUserStatistics(userId));
        report.put("recentProgress", getRecentProgress(userId, 10));

        return report;
    }

    /**
     * Get recent progress activities
     */
    private List<UserProgress> getRecentProgress(String userId, int limit) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        return progressRepository.findByUser(user)
                .stream()
                .sorted(Comparator.comparing(UserProgress::getLastAccessedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(limit)
                .collect(Collectors.toList());
    }
}
