package com.example.english.service;

import com.example.english.entity.*;
import com.example.english.exception.ResourceNotFoundException;
import com.example.english.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private GameRepository gameRepository;

    @Autowired
    private LearningPathRepository learningPathRepository;

    @Autowired
    private UserProgressRepository userProgressRepository;

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private LevelAssessmentRepository assessmentRepository;

    /**
     * Generate personalized learning path for a user based on their level and progress
     */
    public List<LearningPath> generateLearningPath(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        String userLevel = user.getCurrentLevel();
        if (userLevel == null || userLevel.isEmpty()) {
            userLevel = "BEGINNER"; // Default level
        }

        // Get all active lessons for user's level
        List<Lesson> availableLessons = lessonRepository.findByLevelAndIsActiveTrue(userLevel);

        // Get user's completed lessons
        List<UserProgress> completedProgress = userProgressRepository.findByUserAndStatus(user, "COMPLETED");
        Set<String> completedLessonIds = completedProgress.stream()
                .filter(p -> "LESSON".equals(p.getProgressType()))
                .map(UserProgress::getReferenceId)
                .collect(Collectors.toSet());

        // Filter out completed lessons and recommend based on type variety
        List<Lesson> recommendedLessons = availableLessons.stream()
                .filter(lesson -> !completedLessonIds.contains(lesson.getLessonId()))
                .sorted((l1, l2) -> {
                    // Prioritize lessons by type variety and difficulty
                    int typeCompare = l1.getLessonType().compareTo(l2.getLessonType());
                    if (typeCompare != 0) return typeCompare;
                    return l1.getDifficultyLevel().compareTo(l2.getDifficultyLevel());
                })
                .limit(20) // Limit to 20 recommended lessons
                .collect(Collectors.toList());

        // Create learning paths
        List<LearningPath> paths = new ArrayList<>();
        int order = 1;

        for (Lesson lesson : recommendedLessons) {
            // Check if path already exists
            Optional<LearningPath> existingPath = learningPathRepository.findByUserAndLesson(user, lesson);
            
            if (existingPath.isEmpty()) {
                LearningPath path = new LearningPath();
                path.setPathId(UUID.randomUUID().toString());
                path.setUser(user);
                path.setLesson(lesson);
                path.setStatus("PENDING");
                path.setProgressPercentage(0);
                path.setRecommendedOrder(order++);
                path.setCreatedAt(LocalDateTime.now());
                paths.add(path);
            }
        }

        // Save all paths
        if (!paths.isEmpty()) {
            learningPathRepository.saveAll(paths);
        }

        return learningPathRepository.findByUserOrderByRecommendedOrderAsc(user);
    }

    /**
     * Recommend lessons based on weak areas identified from assessments
     */
    public List<Lesson> recommendLessonsForWeakAreas(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Optional<LevelAssessment> latestAssessment = assessmentRepository.findFirstByUserOrderByCompletedAtDesc(user);
        
        if (latestAssessment.isEmpty()) {
            return lessonRepository.findByLevelAndIsActiveTrue(
                    user.getCurrentLevel() != null ? user.getCurrentLevel() : "BEGINNER");
        }

        LevelAssessment assessment = latestAssessment.get();
        String userLevel = assessment.getOverallLevel() != null ? assessment.getOverallLevel() : "BEGINNER";
        
        // Identify weakest skill (lowest score)
        Map<String, BigDecimal> skillScores = new HashMap<>();
        skillScores.put("LISTENING", assessment.getListeningScore() != null ? assessment.getListeningScore() : BigDecimal.ZERO);
        skillScores.put("READING", assessment.getReadingScore() != null ? assessment.getReadingScore() : BigDecimal.ZERO);
        skillScores.put("WRITING", assessment.getWritingScore() != null ? assessment.getWritingScore() : BigDecimal.ZERO);
        skillScores.put("SPEAKING", assessment.getSpeakingScore() != null ? assessment.getSpeakingScore() : BigDecimal.ZERO);
        skillScores.put("GRAMMAR", assessment.getGrammarScore() != null ? assessment.getGrammarScore() : BigDecimal.ZERO);
        skillScores.put("VOCABULARY", assessment.getVocabularyScore() != null ? assessment.getVocabularyScore() : BigDecimal.ZERO);

        String weakestSkill = skillScores.entrySet().stream()
                .min(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("GRAMMAR");

        // Recommend lessons for weakest skill area
        return lessonRepository.findByLevelAndLessonType(userLevel, weakestSkill)
                .stream()
                .filter(Lesson::getIsActive)
                .limit(5)
                .collect(Collectors.toList());
    }

    /**
     * Recommend games based on user level and preferences
     */
    public List<Game> recommendGames(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        String userLevel = user.getCurrentLevel() != null ? user.getCurrentLevel() : "BEGINNER";
        return gameRepository.findByLevelAndIsActiveTrue(userLevel)
                .stream()
                .limit(10)
                .collect(Collectors.toList());
    }

    /**
     * Get next recommended lesson for user
     */
    public Lesson getNextRecommendedLesson(String userId) {
        List<LearningPath> paths = learningPathRepository.findByUserOrderByRecommendedOrderAsc(
                userRepository.findById(userId)
                        .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId)));

        return paths.stream()
                .filter(p -> "PENDING".equals(p.getStatus()) || "IN_PROGRESS".equals(p.getStatus()))
                .map(LearningPath::getLesson)
                .findFirst()
                .orElse(null);
    }
}

