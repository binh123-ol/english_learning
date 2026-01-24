package com.example.english.service;

import com.example.english.entity.*;
import com.example.english.exception.BadRequestException;
import com.example.english.exception.ResourceNotFoundException;
import com.example.english.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Map;
import java.util.UUID;

@Service
public class ConversationService {

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private ConversationMessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserProgressRepository progressRepository;

    @Autowired
    private AIService aiService;

    @Autowired
    private AnalyticsService analyticsService;

    @Transactional
    public Conversation startConversation(String userId, String topic, String difficultyLevel) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Conversation conversation = new Conversation();
        conversation.setConversationId(UUID.randomUUID().toString());
        conversation.setUser(user);
        conversation.setTopic(topic);
        conversation.setDifficultyLevel(difficultyLevel != null ? difficultyLevel : user.getCurrentLevel());
        conversation.setStatus("ACTIVE");
        conversation.setMessagesCount(0);
        conversation.setXpEarned(0);
        conversation.setStartedAt(LocalDateTime.now());
        conversation.setCreatedAt(LocalDateTime.now());

        return conversationRepository.save(conversation);
    }

    @Transactional
    public ConversationMessage sendMessage(String conversationId, String userMessage, String audioFileUrl) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation", "id", conversationId));

        if (!"ACTIVE".equals(conversation.getStatus())) {
            throw new BadRequestException("Conversation is not active");
        }

        // Save user message
        ConversationMessage userMsg = new ConversationMessage();
        userMsg.setMessageId(UUID.randomUUID().toString());
        userMsg.setConversation(conversation);
        userMsg.setSenderType("USER");
        userMsg.setContent(userMessage);
        userMsg.setSentAt(LocalDateTime.now());

        // Analyze user message with AI (Vosk pronunciation + grammar + spelling)
        if (audioFileUrl != null && !audioFileUrl.isEmpty()) {
            AIService.PronunciationAnalysis analysis = aiService.analyzePronunciation(userMessage, audioFileUrl);
            userMsg.setPronunciationScore(analysis.getScore());
        }

        List<Map<String, String>> grammarErrors = aiService.checkGrammar(userMessage);
        List<Map<String, String>> spellingErrors = aiService.checkSpelling(userMessage);

        if (!grammarErrors.isEmpty()) {
            userMsg.setGrammarErrors(grammarErrors.toString()); // In production, use JSON serializer
        }
        if (!spellingErrors.isEmpty()) {
            userMsg.setSpellingErrors(spellingErrors.toString()); // In production, use JSON serializer
        }

        // Generate feedback
        String feedback = generateFeedback(grammarErrors, spellingErrors, userMsg.getPronunciationScore());
        userMsg.setFeedback(feedback);

        messageRepository.save(userMsg);

        // Generate AI response
        String aiResponse = aiService.generateAIResponse(userMessage, conversation.getTopic());
        ConversationMessage aiMsg = new ConversationMessage();
        aiMsg.setMessageId(UUID.randomUUID().toString());
        aiMsg.setConversation(conversation);
        aiMsg.setSenderType("AI");
        aiMsg.setContent(aiResponse);
        aiMsg.setSentAt(LocalDateTime.now());

        messageRepository.save(aiMsg);

        // Update conversation
        conversation.setMessagesCount(conversation.getMessagesCount() + 2);
        conversationRepository.save(conversation);

        return userMsg;
    }

    @Transactional
    public Conversation endConversation(String conversationId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation", "id", conversationId));

        conversation.setStatus("COMPLETED");
        conversation.setEndedAt(LocalDateTime.now());

        // Calculate XP based on messages sent
        int messageCount = conversation.getMessagesCount();
        int xpEarned = Math.min(messageCount * 2, 50); // Max 50 XP per conversation
        conversation.setXpEarned(xpEarned);

        // Update user progress
        User user = conversation.getUser();
        List<UserProgress> existingProgressList = progressRepository.findByUserAndReferenceIdAndProgressType(
                user, conversationId, "CONVERSATION");

        UserProgress progress;
        if (!existingProgressList.isEmpty()) {
            progress = existingProgressList.get(0);
        } else {
            progress = new UserProgress();
            progress.setProgressId(UUID.randomUUID().toString());
            progress.setUser(user);
            progress.setProgressType("CONVERSATION");
            progress.setReferenceId(conversationId);
            progress.setCreatedAt(LocalDateTime.now());
        }

        progress.setStatus("COMPLETED");
        progress.setProgressPercentage(100);
        progress.setXpEarned(xpEarned);
        progress.setCompletedAt(LocalDateTime.now());
        progress.setLastAccessedAt(LocalDateTime.now());

        progressRepository.save(progress);

        // Update analytics
        long durationMinutes = conversation.getStartedAt() != null && conversation.getEndedAt() != null
                ? java.time.Duration.between(conversation.getStartedAt(), conversation.getEndedAt()).toMinutes()
                : 10;
        analyticsService.updateDailyStatistics(user.getUserId(), "CONVERSATION", xpEarned, (int) durationMinutes);

        return conversationRepository.save(conversation);
    }

    public List<Conversation> getUserConversations(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return conversationRepository.findByUser(user);
    }

    public List<ConversationMessage> getConversationMessages(String conversationId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation", "id", conversationId));
        return messageRepository.findByConversationOrderBySentAtAsc(conversation);
    }

    private String generateFeedback(List<Map<String, String>> grammarErrors,
            List<Map<String, String>> spellingErrors,
            BigDecimal pronunciationScore) {
        StringBuilder feedback = new StringBuilder();

        if (pronunciationScore != null) {
            double score = pronunciationScore.doubleValue();
            if (score >= 0.8) {
                feedback.append("Great pronunciation! ");
            } else if (score >= 0.6) {
                feedback.append("Good pronunciation, but there's room for improvement. ");
            } else {
                feedback.append("Keep practicing your pronunciation. ");
            }
        }

        if (!spellingErrors.isEmpty()) {
            feedback.append("Watch out for spelling mistakes. ");
        }

        if (!grammarErrors.isEmpty()) {
            feedback.append("Check your grammar. ");
        }

        if (grammarErrors.isEmpty() && spellingErrors.isEmpty() &&
                (pronunciationScore == null || pronunciationScore.doubleValue() >= 0.8)) {
            feedback.append("Excellent work! Keep it up!");
        }

        return feedback.toString();
    }
}
