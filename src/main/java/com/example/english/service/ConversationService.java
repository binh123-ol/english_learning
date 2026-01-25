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
import java.util.Collections;
import java.util.List;
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

        Conversation savedConversation = conversationRepository.save(conversation);

        // Add initial AI greeting
        String greeting = "Hello " + user.getUsername() + ", how can I help you to improve your speaking skill today?";
        ConversationMessage aiMsg = new ConversationMessage();
        aiMsg.setMessageId(UUID.randomUUID().toString());
        aiMsg.setConversation(savedConversation);
        aiMsg.setSenderType("AI");
        aiMsg.setContent(greeting);
        aiMsg.setSentAt(LocalDateTime.now());

        // Add translation for greeting
        String translation = aiService.translateText(greeting);
        aiMsg.setFeedback("TRANSLATION:" + translation);

        messageRepository.save(aiMsg);

        savedConversation.setMessagesCount(1);
        return conversationRepository.save(savedConversation);
    }

    @Transactional
    public ConversationMessage sendMessage(String conversationId, String userMessage, String audioFileUrl,
            List<AIService.WordDetail> frontendDetails) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation", "id", conversationId));

        if (!"ACTIVE".equals(conversation.getStatus())) {
            throw new BadRequestException("Conversation is not active");
        }

        // Check message limit (10-15 sentences, let's say 15 messages)
        if (conversation.getMessagesCount() >= 15) {
            throw new BadRequestException(
                    "Conversation limit reached (15 messages). Please end the session to see your report.");
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

            // Store word-level details as JSON string in feedback
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                String detailsJson = mapper.writeValueAsString(analysis.getDetails());
                userMsg.setFeedback(detailsJson);
            } catch (Exception e) {
                userMsg.setFeedback("");
            }
        } else if (frontendDetails != null && !frontendDetails.isEmpty()) {
            // If no audio but frontend provided details (STT with confidence)
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                String detailsJson = mapper.writeValueAsString(frontendDetails);
                userMsg.setFeedback(detailsJson);

                // Calculate a simple score from frontend details
                long correctCount = frontendDetails.stream().filter(d -> "correct".equals(d.getStatus())).count();
                double score = (double) correctCount / frontendDetails.size();
                userMsg.setPronunciationScore(BigDecimal.valueOf(score).setScale(2, java.math.RoundingMode.HALF_UP));
            } catch (Exception e) {
                userMsg.setFeedback("");
            }
        }

        List<Map<String, String>> grammarErrors = aiService.checkGrammar(userMessage);
        List<Map<String, String>> spellingErrors = aiService.checkSpelling(userMessage);

        if (!grammarErrors.isEmpty()) {
            userMsg.setGrammarErrors(grammarErrors.toString());
        }
        if (!spellingErrors.isEmpty()) {
            userMsg.setSpellingErrors(spellingErrors.toString());
        }

        messageRepository.save(userMsg);

        // Generate AI response using Gemini
        String aiResponse = aiService.generateAIResponse(userMessage, conversation.getTopic());
        ConversationMessage aiMsg = new ConversationMessage();
        aiMsg.setMessageId(UUID.randomUUID().toString());
        aiMsg.setConversation(conversation);
        aiMsg.setSenderType("AI");
        aiMsg.setContent(aiResponse);
        aiMsg.setSentAt(LocalDateTime.now());

        // Optionally pre-translate AI response
        String translation = aiService.translateText(aiResponse);
        // We'll store it in a way the frontend can access (e.g., appended or in a
        // specific format)
        // For now, let's add it to the feedback field for AI messages
        aiMsg.setFeedback("TRANSLATION:" + translation);

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
