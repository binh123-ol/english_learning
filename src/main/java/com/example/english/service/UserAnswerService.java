package com.example.english.service;

import com.example.english.dto.UserAnswerDTO;
import com.example.english.entity.UserAnswer;
import com.example.english.entity.Session;
import com.example.english.entity.Question;
import com.example.english.entity.Option;
import com.example.english.exception.BadRequestException;
import com.example.english.exception.ResourceNotFoundException;
import com.example.english.repository.UserAnswerRepository;
import com.example.english.repository.SessionRepository;
import com.example.english.repository.QuestionRepository;
import com.example.english.repository.OptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Service
public class UserAnswerService {

    @Autowired
    private UserAnswerRepository userAnswerRepository;

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private OptionRepository optionRepository;

    @Autowired
    private SessionService sessionService;

    /**
     * Submit an answer with automatic scoring
     */
    @Transactional
    public UserAnswer submitAnswer(UserAnswerDTO dto) {
        // Validate session
        Session session = sessionRepository.findById(dto.getSessionId())
                .orElseThrow(() -> new ResourceNotFoundException("Session", "id", dto.getSessionId()));
        
        // Check if session is still active
        if (session.getFinishedAt() != null) {
            throw new BadRequestException("Cannot submit answer to a finished session");
        }

        // Check if session has expired
        if (sessionService.isSessionExpired(dto.getSessionId())) {
            throw new BadRequestException("Session has expired. Time limit exceeded.");
        }

        // Validate question
        Question question = questionRepository.findById(dto.getQuestionId())
                .orElseThrow(() -> new ResourceNotFoundException("Question", "id", dto.getQuestionId()));

        // Check if answer already exists for this question in this session
        if (userAnswerRepository.existsBySessionAndQuestion(session, question)) {
            throw new BadRequestException("Answer already submitted for this question");
        }

        // Process answer based on question type
        UserAnswer userAnswer = new UserAnswer();
        userAnswer.setAnswerId(UUID.randomUUID().toString());
        userAnswer.setSession(session);
        userAnswer.setQuestion(question);
        userAnswer.setAnsweredAt(LocalDateTime.now());

        // Score the answer
        scoreAnswer(userAnswer, question, dto);

        return userAnswerRepository.save(userAnswer);
    }

    /**
     * Automatic scoring logic
     */
    private void scoreAnswer(UserAnswer userAnswer, Question question, UserAnswerDTO dto) {
        boolean isCorrect = false;
        BigDecimal scoreEarned = BigDecimal.ZERO;

        // For multiple choice questions
        if (dto.getSelectedOptionId() != null) {
            Option selectedOption = optionRepository.findById(dto.getSelectedOptionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Option", "id", dto.getSelectedOptionId()));
            
            // Validate option belongs to this question
            if (!selectedOption.getQuestion().getQuestionId().equals(question.getQuestionId())) {
                throw new BadRequestException("Selected option does not belong to this question");
            }

            userAnswer.setSelectedOption(selectedOption);
            
            // Check if option is correct - handle Boolean properly
            Boolean optionIsCorrect = selectedOption.getIsCorrect();
            if (optionIsCorrect == null) {
                // If null, default to false
                isCorrect = false;
            } else {
                // Use Boolean.booleanValue() to ensure proper comparison
                isCorrect = optionIsCorrect.booleanValue();
            }
            
            // Log for debugging
            System.out.println("Scoring answer - Question: " + question.getQuestionId() + 
                             ", Option: " + selectedOption.getOptionId() + 
                             ", Option Text: " + selectedOption.getOptionText() + 
                             ", IsCorrect: " + optionIsCorrect + 
                             ", Result: " + isCorrect);
        }
        // For text-based questions
        else if (dto.getTextResponse() != null && !dto.getTextResponse().trim().isEmpty()) {
            String userAnswerText = dto.getTextResponse().trim();
            userAnswer.setTextResponse(userAnswerText);
            
            // Check against correct answer text (case-insensitive)
            if (question.getCorrectAnswerText() != null && !question.getCorrectAnswerText().trim().isEmpty()) {
                String correctAnswerText = question.getCorrectAnswerText().trim();
                isCorrect = correctAnswerText.equalsIgnoreCase(userAnswerText);
            } else {
                // If no correct answer is set, mark as incorrect
                isCorrect = false;
            }
        } else {
            throw new BadRequestException("Either selectedOptionId or textResponse must be provided");
        }

        // Award points if correct
        if (isCorrect) {
            scoreEarned = question.getScorePoints() != null ? question.getScorePoints() : BigDecimal.ZERO;
        }

        userAnswer.setIsCorrect(isCorrect);
        userAnswer.setScoreEarned(scoreEarned);
    }

    public List<UserAnswer> getAllAnswers() {
        return userAnswerRepository.findAll();
    }

    public UserAnswer getAnswerById(String id) {
        return userAnswerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("UserAnswer", "id", id));
    }

    public List<UserAnswer> getAnswersBySession(String sessionId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session", "id", sessionId));
        return userAnswerRepository.findBySession(session);
    }

    @Transactional
    public void deleteAnswer(String id) {
        if (!userAnswerRepository.existsById(id)) {
            throw new ResourceNotFoundException("UserAnswer", "id", id);
        }
        userAnswerRepository.deleteById(id);
    }
}
