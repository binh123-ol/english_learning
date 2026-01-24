package com.example.english.service;

import com.example.english.entity.Session;
import com.example.english.entity.User;
import com.example.english.entity.Exam;
import com.example.english.entity.UserAnswer;
import com.example.english.exception.BadRequestException;
import com.example.english.exception.ResourceNotFoundException;
import com.example.english.repository.SessionRepository;
import com.example.english.repository.UserRepository;
import com.example.english.repository.ExamRepository;
import com.example.english.repository.UserAnswerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.time.LocalDateTime;

@Service
public class SessionService {

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private UserAnswerRepository userAnswerRepository;

    @Autowired
    private AnalyticsService analyticsService;

    @Transactional
    public Session createSession(String userId, String examId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam", "id", examId));
        Session s = new Session();
        s.setSessionId(UUID.randomUUID().toString());
        s.setUser(user);
        s.setExam(exam);
        s.setStartedAt(LocalDateTime.now());
        return sessionRepository.save(s);
    }

    public List<Session> getAllSessions() {
        return sessionRepository.findAll();
    }

    public List<Session> getSessionsByExam(String examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam", "id", examId));
        return sessionRepository.findByExamOrderByFinishedAtDesc(exam);
    }

    public List<Session> getSessionsByUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        return sessionRepository.findByUserOrderByStartedAtDesc(user);
    }

    public Session getSessionById(String id) {
        return sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Session", "id", id));
    }

    /**
     * Check if session has exceeded the exam duration
     */
    public boolean isSessionExpired(String sessionId) {
        Session session = getSessionById(sessionId);

        if (session.getFinishedAt() != null) {
            return true; // Already finished
        }

        LocalDateTime startTime = session.getStartedAt();
        int durationMinutes = session.getExam().getDurationMinutes();
        LocalDateTime expiryTime = startTime.plusMinutes(durationMinutes);

        return LocalDateTime.now().isAfter(expiryTime);
    }

    /**
     * Get remaining time in minutes for a session
     */
    public long getRemainingMinutes(String sessionId) {
        Session session = getSessionById(sessionId);

        if (session.getFinishedAt() != null) {
            return 0; // Already finished
        }

        LocalDateTime startTime = session.getStartedAt();
        int durationMinutes = session.getExam().getDurationMinutes();
        LocalDateTime expiryTime = startTime.plusMinutes(durationMinutes);
        LocalDateTime now = LocalDateTime.now();

        if (now.isAfter(expiryTime)) {
            return 0; // Expired
        }

        return java.time.Duration.between(now, expiryTime).toMinutes();
    }

    @Transactional
    public Session finishSession(String id) {
        Session session = getSessionById(id);

        // Check if already finished
        if (session.getFinishedAt() != null) {
            // Nếu phiên đã kết thúc, trả về kết quả hiện tại thay vì báo lỗi
            return session;
        }

        // Calculate final score
        calculateSessionScore(session);

        session.setFinishedAt(LocalDateTime.now());
        Session savedSession = sessionRepository.save(session);

        // Award XP for completing the exam
        // Since Exam entity doesn't have xpReward field, use a default value
        // TODO: Consider adding xp_reward column to exams table in the future
        int xpEarned = 50; // Default XP for completing an exam

        // Update analytics
        Integer estimatedTime = session.getExam().getDurationMinutes();
        analyticsService.updateDailyStatistics(
                session.getUser().getUserId(),
                "EXAM",
                xpEarned,
                estimatedTime);

        return savedSession;
    }

    /**
     * Calculate total score and correct answers for a session
     */
    private void calculateSessionScore(Session session) {
        List<UserAnswer> answers = userAnswerRepository.findBySession(session);

        int totalCorrect = 0;
        int totalQuestions = answers.size();
        java.math.BigDecimal finalScore = java.math.BigDecimal.ZERO;

        for (UserAnswer answer : answers) {
            // Log for debugging
            Boolean isCorrect = answer.getIsCorrect();
            System.out.println("Session Score Calculation - Answer ID: " + answer.getAnswerId() +
                    ", Question: " + answer.getQuestion().getQuestionId() +
                    ", IsCorrect: " + isCorrect +
                    ", ScoreEarned: " + answer.getScoreEarned());

            if (isCorrect != null && isCorrect) {
                totalCorrect++;
            }
            finalScore = finalScore
                    .add(answer.getScoreEarned() != null ? answer.getScoreEarned() : java.math.BigDecimal.ZERO);
        }

        System.out.println("Session Score Summary - Total Questions: " + totalQuestions +
                ", Total Correct: " + totalCorrect +
                ", Final Score: " + finalScore);

        session.setTotalCorrect(totalCorrect);
        session.setFinalScore(finalScore);

        // Calculate band score if applicable (for IELTS-style exams)
        if (session.getExam().getExamType().toLowerCase().contains("ielts")) {
            java.math.BigDecimal bandScore = calculateBandScore(totalCorrect, totalQuestions);
            session.setBandScore(bandScore);
        }
    }

    /**
     * Calculate IELTS band score based on correct answers
     * This is a simplified calculation - actual IELTS scoring is more complex
     */
    private java.math.BigDecimal calculateBandScore(int correctAnswers, int totalQuestions) {
        if (totalQuestions == 0)
            return java.math.BigDecimal.ZERO;

        double percentage = (double) correctAnswers / totalQuestions * 100;

        // Simplified band score mapping
        if (percentage >= 90)
            return new java.math.BigDecimal("9.0");
        if (percentage >= 82)
            return new java.math.BigDecimal("8.5");
        if (percentage >= 75)
            return new java.math.BigDecimal("8.0");
        if (percentage >= 68)
            return new java.math.BigDecimal("7.5");
        if (percentage >= 60)
            return new java.math.BigDecimal("7.0");
        if (percentage >= 52)
            return new java.math.BigDecimal("6.5");
        if (percentage >= 45)
            return new java.math.BigDecimal("6.0");
        if (percentage >= 37)
            return new java.math.BigDecimal("5.5");
        if (percentage >= 30)
            return new java.math.BigDecimal("5.0");
        if (percentage >= 22)
            return new java.math.BigDecimal("4.5");
        if (percentage >= 15)
            return new java.math.BigDecimal("4.0");
        return new java.math.BigDecimal("3.5");
    }

    @Transactional
    public void deleteSession(String id) {
        if (!sessionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Session", "id", id);
        }
        sessionRepository.deleteById(id);
    }
}
