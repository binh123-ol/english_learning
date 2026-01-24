package com.example.english.service;

import com.example.english.entity.*;
import com.example.english.exception.ResourceNotFoundException;
import com.example.english.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class LessonService {

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LearningPathRepository learningPathRepository;

    @Autowired
    private UserProgressRepository progressRepository;

    @Autowired
    private AnalyticsService analyticsService;

    public List<Lesson> getAllLessons() {
        return lessonRepository.findAll();
    }

    public List<Lesson> getLessonsByLevel(String level) {
        return lessonRepository.findByLevelAndIsActiveTrue(level);
    }

    public List<Lesson> getLessonsByType(String lessonType) {
        return lessonRepository.findByLessonType(lessonType);
    }

    public Lesson getLessonById(String id) {
        return lessonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", "id", id));
    }

    @Transactional
    public Lesson createLesson(Lesson lesson) {
        lesson.setLessonId(UUID.randomUUID().toString());
        return lessonRepository.save(lesson);
    }

    @Transactional
    public LearningPath startLesson(String userId, String lessonId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        Lesson lesson = getLessonById(lessonId);

        // Check if path already exists
        Optional<LearningPath> existingPath = learningPathRepository.findByUserAndLesson(user, lesson);

        if (existingPath.isPresent()) {
            LearningPath path = existingPath.get();
            if ("PENDING".equals(path.getStatus())) {
                path.setStatus("IN_PROGRESS");
                path.setStartedAt(LocalDateTime.now());
            }
            return learningPathRepository.save(path);
        }

        // Create new learning path
        LearningPath path = new LearningPath();
        path.setPathId(UUID.randomUUID().toString());
        path.setUser(user);
        path.setLesson(lesson);
        path.setStatus("IN_PROGRESS");
        path.setProgressPercentage(0);
        path.setStartedAt(LocalDateTime.now());
        path.setCreatedAt(LocalDateTime.now());

        return learningPathRepository.save(path);
    }

    @Transactional
    public LearningPath completeLesson(String userId, String lessonId, Integer accuracyPercentage) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        Lesson lesson = getLessonById(lessonId);

        LearningPath path = learningPathRepository.findByUserAndLesson(user, lesson)
                .orElseGet(() -> {
                    LearningPath newPath = new LearningPath();
                    newPath.setPathId(UUID.randomUUID().toString());
                    newPath.setUser(user);
                    newPath.setLesson(lesson);
                    newPath.setStatus("IN_PROGRESS");
                    newPath.setProgressPercentage(0);
                    newPath.setStartedAt(LocalDateTime.now());
                    newPath.setCreatedAt(LocalDateTime.now());
                    return learningPathRepository.save(newPath);
                });

        if ("COMPLETED".equals(path.getStatus())) {
            return path;
        }

        path.setStatus("COMPLETED");
        path.setProgressPercentage(100);
        path.setCompletedAt(LocalDateTime.now());

        // Create or update user progress
        List<UserProgress> existingProgressList = progressRepository.findByUserAndReferenceIdAndProgressType(
                user, lessonId, "LESSON");

        UserProgress progress;
        if (!existingProgressList.isEmpty()) {
            progress = existingProgressList.get(0);
            // Optionally could delete duplicates here if list.size() > 1
        } else {
            progress = new UserProgress();
            progress.setProgressId(UUID.randomUUID().toString());
            progress.setUser(user);
            progress.setLesson(lesson);
            progress.setProgressType("LESSON");
            progress.setReferenceId(lessonId);
            progress.setCreatedAt(LocalDateTime.now());
        }

        progress.setStatus("COMPLETED");
        progress.setProgressPercentage(100);
        progress.setXpEarned(lesson.getXpReward() != null ? lesson.getXpReward() : 0);
        progress.setAccuracyPercentage(accuracyPercentage);
        progress.setCompletedAt(LocalDateTime.now());
        progress.setLastAccessedAt(LocalDateTime.now());

        progressRepository.save(progress);

        // Update analytics
        Integer estimatedTime = (lesson.getEstimatedDurationMinutes() != null)
                ? lesson.getEstimatedDurationMinutes()
                : 15;
        analyticsService.updateDailyStatistics(userId, "LESSON",
                lesson.getXpReward() != null ? lesson.getXpReward() : 0, estimatedTime);

        return learningPathRepository.save(path);
    }

    @Transactional
    public LearningPath updateLessonProgress(String userId, String lessonId, Integer progressPercentage,
            Integer accuracyPercentage) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        Lesson lesson = getLessonById(lessonId);

        LearningPath path = learningPathRepository.findByUserAndLesson(user, lesson)
                .orElseGet(() -> {
                    LearningPath newPath = new LearningPath();
                    newPath.setPathId(UUID.randomUUID().toString());
                    newPath.setUser(user);
                    newPath.setLesson(lesson);
                    newPath.setStatus("IN_PROGRESS");
                    newPath.setProgressPercentage(0);
                    newPath.setStartedAt(LocalDateTime.now());
                    newPath.setCreatedAt(LocalDateTime.now());
                    return learningPathRepository.save(newPath);
                });

        path.setProgressPercentage(Math.min(100, Math.max(0, progressPercentage)));

        if ("PENDING".equals(path.getStatus()) && progressPercentage > 0) {
            path.setStatus("IN_PROGRESS");
            if (path.getStartedAt() == null) {
                path.setStartedAt(LocalDateTime.now());
            }
        }

        // Update user progress
        List<UserProgress> existingProgressList = progressRepository.findByUserAndReferenceIdAndProgressType(
                user, lessonId, "LESSON");

        UserProgress progress;
        if (!existingProgressList.isEmpty()) {
            progress = existingProgressList.get(0);
        } else {
            progress = new UserProgress();
            progress.setProgressId(UUID.randomUUID().toString());
            progress.setUser(user);
            progress.setLesson(lesson);
            progress.setProgressType("LESSON");
            progress.setReferenceId(lessonId);
            progress.setCreatedAt(LocalDateTime.now());
        }

        // Award XP when reaching 100% for the first time
        boolean wasCompleted = "COMPLETED".equals(progress.getStatus());
        boolean isNowCompleted = progressPercentage >= 100;

        progress.setProgressPercentage(progressPercentage);
        progress.setAccuracyPercentage(accuracyPercentage);
        progress.setStatus(isNowCompleted ? "COMPLETED" : "IN_PROGRESS");
        progress.setLastAccessedAt(LocalDateTime.now());

        if (isNowCompleted && !wasCompleted) {
            // First time reaching 100%, award XP
            Integer xpReward = lesson.getXpReward() != null ? lesson.getXpReward() : 0;
            progress.setXpEarned(xpReward);
            progress.setCompletedAt(LocalDateTime.now());

            // Update analytics
            Integer estimatedTime = (lesson.getEstimatedDurationMinutes() != null)
                    ? lesson.getEstimatedDurationMinutes()
                    : 15;
            analyticsService.updateDailyStatistics(userId, "LESSON", xpReward, estimatedTime);
        }

        progressRepository.save(progress);

        return learningPathRepository.save(path);
    }

    @Transactional
    public Lesson updateLesson(Lesson lesson) {
        Lesson existing = getLessonById(lesson.getLessonId());
        existing.setTitle(lesson.getTitle());
        existing.setLessonType(lesson.getLessonType());
        existing.setLevel(lesson.getLevel());
        existing.setDescription(lesson.getDescription());
        existing.setContent(lesson.getContent());
        existing.setEstimatedDurationMinutes(lesson.getEstimatedDurationMinutes());
        existing.setXpReward(lesson.getXpReward());
        existing.setDifficultyLevel(lesson.getDifficultyLevel());
        existing.setOrderIndex(lesson.getOrderIndex());
        existing.setIsActive(lesson.getIsActive());
        return lessonRepository.save(existing);
    }

    public List<UserProgress> getUserProgress(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return progressRepository.findByUserAndProgressType(user, "LESSON");
    }

    @Transactional
    public void deleteLesson(String id) {
        Lesson lesson = getLessonById(id);
        lessonRepository.delete(lesson);
    }
}
