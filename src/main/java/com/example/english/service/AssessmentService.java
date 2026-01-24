package com.example.english.service;

import com.example.english.dto.*;
import com.example.english.entity.*;
import com.example.english.exception.BadRequestException;
import com.example.english.exception.ResourceNotFoundException;
import com.example.english.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AssessmentService {

    @Autowired
    private LevelAssessmentRepository assessmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AssessmentQuestionRepository questionRepository;

    @Autowired
    private AssessmentOptionRepository optionRepository;

    @Autowired
    private AssessmentAnswerRepository answerRepository;

    @Autowired
    private AIService aiService; // Sử dụng Vosk để chấm điểm phát âm cho SPEAKING

    private static final int QUESTIONS_PER_SKILL = 5;
    private static final String[] SKILL_TYPES = {
        "LISTENING", "READING", "WRITING", "SPEAKING", "GRAMMAR", "VOCABULARY"
    };

    @Transactional
    public LevelAssessment createAssessment(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        LevelAssessment assessment = new LevelAssessment();
        assessment.setAssessmentId(UUID.randomUUID().toString());
        assessment.setUser(user);
        assessment.setCreatedAt(LocalDateTime.now());

        return assessmentRepository.save(assessment);
    }

    @Transactional
    public LevelAssessment completeAssessment(String assessmentId, 
                                             BigDecimal listeningScore,
                                             BigDecimal readingScore,
                                             BigDecimal writingScore,
                                             BigDecimal speakingScore,
                                             BigDecimal grammarScore,
                                             BigDecimal vocabularyScore) {
        LevelAssessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment", "id", assessmentId));

        if (assessment.getCompletedAt() != null) {
            throw new BadRequestException("Assessment already completed");
        }

        // Set individual scores
        assessment.setListeningScore(listeningScore);
        assessment.setReadingScore(readingScore);
        assessment.setWritingScore(writingScore);
        assessment.setSpeakingScore(speakingScore);
        assessment.setGrammarScore(grammarScore);
        assessment.setVocabularyScore(vocabularyScore);

        // Calculate overall score (average of all skills)
        BigDecimal overallScore = listeningScore
                .add(readingScore)
                .add(writingScore)
                .add(speakingScore)
                .add(grammarScore)
                .add(vocabularyScore)
                .divide(BigDecimal.valueOf(6), 2, RoundingMode.HALF_UP);

        assessment.setOverallScore(overallScore);

        // Determine overall level based on score (0-100 scale)
        String overallLevel = determineLevel(overallScore);
        assessment.setOverallLevel(overallLevel);

        assessment.setCompletedAt(LocalDateTime.now());

        // Update user with assessment results
        User user = assessment.getUser();
        user.setCurrentLevel(overallLevel);
        user.setAssessmentCompleted(true);
        userRepository.save(user);

        return assessmentRepository.save(assessment);
    }

    /**
     * Get assessment questions grouped by skill type
     */
    public AssessmentResponseDTO getAssessmentQuestions(String assessmentId) {
        LevelAssessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment", "id", assessmentId));

        if (assessment.getCompletedAt() != null) {
            throw new BadRequestException("Assessment already completed");
        }

        Map<String, List<AssessmentQuestionDTO>> questionsBySkill = new HashMap<>();
        int totalQuestions = 0;

        for (String skillType : SKILL_TYPES) {
            List<AssessmentQuestion> questions = questionRepository
                    .findBySkillTypeOrderByOrderIndexAsc(skillType)
                    .stream()
                    .limit(QUESTIONS_PER_SKILL)
                    .collect(Collectors.toList());

            List<AssessmentQuestionDTO> questionDTOs = questions.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            questionsBySkill.put(skillType, questionDTOs);
            totalQuestions += questionDTOs.size();
        }

        AssessmentResponseDTO response = new AssessmentResponseDTO();
        response.setAssessmentId(assessmentId);
        response.setQuestionsBySkill(questionsBySkill);
        response.setTotalQuestions(totalQuestions);
        response.setQuestionsPerSkill(QUESTIONS_PER_SKILL);

        return response;
    }

    /**
     * Submit answers and automatically calculate scores
     */
    @Transactional
    public AssessmentResultDTO submitAnswers(String assessmentId, List<AssessmentAnswerDTO> answers) {
        LevelAssessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment", "id", assessmentId));

        if (assessment.getCompletedAt() != null) {
            throw new BadRequestException("Assessment already completed");
        }

        // Save answers and calculate scores
        Map<String, BigDecimal> skillScores = new HashMap<>();
        Map<String, Integer> skillTotals = new HashMap<>();
        int totalCorrect = 0;
        int totalQuestions = 0;

        for (AssessmentAnswerDTO answerDTO : answers) {
            AssessmentQuestion question = questionRepository.findById(answerDTO.getQuestionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Question", "id", answerDTO.getQuestionId()));

            AssessmentAnswer answer = new AssessmentAnswer();
            answer.setAnswerId(UUID.randomUUID().toString());
            answer.setAssessment(assessment);
            answer.setQuestion(question);
            answer.setAnsweredAt(LocalDateTime.now());

            BigDecimal scoreEarned = BigDecimal.ZERO;
            boolean isCorrect = false;

            // Check answer based on question type
            if ("MULTIPLE_CHOICE".equals(question.getQuestionType())) {
                if (answerDTO.getSelectedOptionId() != null) {
                    AssessmentOption selectedOption = optionRepository.findById(answerDTO.getSelectedOptionId())
                            .orElse(null);
                    if (selectedOption != null && selectedOption.getIsCorrect()) {
                        isCorrect = true;
                        scoreEarned = question.getScorePoints();
                    }
                }
                answer.setSelectedOptionId(answerDTO.getSelectedOptionId());
            } else if ("TEXT_INPUT".equals(question.getQuestionType()) || "FILL_BLANK".equals(question.getQuestionType())) {
                if (answerDTO.getTextResponse() != null && 
                    answerDTO.getTextResponse().trim().equalsIgnoreCase(question.getCorrectAnswerText().trim())) {
                    isCorrect = true;
                    scoreEarned = question.getScorePoints();
                }
                answer.setTextResponse(answerDTO.getTextResponse());
            } else if ("TRUE_FALSE".equals(question.getQuestionType())) {
                if (answerDTO.getTextResponse() != null && 
                    answerDTO.getTextResponse().trim().equalsIgnoreCase(question.getCorrectAnswerText().trim())) {
                    isCorrect = true;
                    scoreEarned = question.getScorePoints();
                }
                answer.setTextResponse(answerDTO.getTextResponse());
            }

            // Save audio file URL for SPEAKING questions and score with AI
            if ("SPEAKING".equals(question.getSkillType())) {
                if (answerDTO.getAudioFileUrl() != null && !answerDTO.getAudioFileUrl().trim().isEmpty()) {
                    answer.setAudioFileUrl(answerDTO.getAudioFileUrl());
                    // Sử dụng AI (Vosk) để chấm điểm phát âm: score 0.0 - 1.0
                    String expectedText = question.getTextContent() != null ? question.getTextContent() : "";
                    // Nếu user có textResponse (ví dụ transcript), ưu tiên dùng làm expectedText
                    if (answerDTO.getTextResponse() != null && !answerDTO.getTextResponse().trim().isEmpty()) {
                        answer.setTextResponse(answerDTO.getTextResponse());
                        expectedText = answerDTO.getTextResponse();
                    }

                    BigDecimal pronunciationScore = aiService.scorePronunciation(expectedText, answerDTO.getAudioFileUrl());
                    // Quy đổi điểm phát âm về thang điểm của câu hỏi (scorePoints)
                    BigDecimal speakingScore = question.getScorePoints()
                            .multiply(pronunciationScore)
                            .setScale(2, RoundingMode.HALF_UP);

                    answer.setScoreEarned(speakingScore);
                    // Đánh dấu đúng nếu đạt ít nhất 70% điểm tối đa của câu hỏi
                    BigDecimal threshold = question.getScorePoints()
                            .multiply(BigDecimal.valueOf(0.7))
                            .setScale(2, RoundingMode.HALF_UP);
                    answer.setIsCorrect(speakingScore.compareTo(threshold) >= 0);
                } else {
                    // No audio file provided for SPEAKING question
                    answer.setScoreEarned(BigDecimal.ZERO);
                    answer.setIsCorrect(false);
                }
            } else {
                answer.setIsCorrect(isCorrect);
                answer.setScoreEarned(scoreEarned);
            }
            
            answerRepository.save(answer);

            // Accumulate scores by skill
            String skillType = question.getSkillType();
            skillScores.put(skillType, skillScores.getOrDefault(skillType, BigDecimal.ZERO).add(scoreEarned));
            skillTotals.put(skillType, skillTotals.getOrDefault(skillType, 0) + 1);

            if (isCorrect) totalCorrect++;
            totalQuestions++;
        }

        // Calculate percentage scores for each skill (0-100)
        BigDecimal listeningScore = calculateSkillScore("LISTENING", skillScores, skillTotals);
        BigDecimal readingScore = calculateSkillScore("READING", skillScores, skillTotals);
        BigDecimal writingScore = calculateSkillScore("WRITING", skillScores, skillTotals);
        BigDecimal speakingScore = calculateSkillScore("SPEAKING", skillScores, skillTotals);
        BigDecimal grammarScore = calculateSkillScore("GRAMMAR", skillScores, skillTotals);
        BigDecimal vocabularyScore = calculateSkillScore("VOCABULARY", skillScores, skillTotals);

        // Update assessment
        assessment.setListeningScore(listeningScore);
        assessment.setReadingScore(readingScore);
        assessment.setWritingScore(writingScore);
        assessment.setSpeakingScore(speakingScore);
        assessment.setGrammarScore(grammarScore);
        assessment.setVocabularyScore(vocabularyScore);

        // Calculate overall score
        BigDecimal overallScore = listeningScore
                .add(readingScore)
                .add(writingScore)
                .add(speakingScore)
                .add(grammarScore)
                .add(vocabularyScore)
                .divide(BigDecimal.valueOf(6), 2, RoundingMode.HALF_UP);

        assessment.setOverallScore(overallScore);
        String overallLevel = determineLevel(overallScore);
        assessment.setOverallLevel(overallLevel);
        assessment.setCompletedAt(LocalDateTime.now());

        // Update user
        User user = assessment.getUser();
        user.setCurrentLevel(overallLevel);
        user.setAssessmentCompleted(true);
        userRepository.save(user);

        assessmentRepository.save(assessment);

        // Build result DTO
        AssessmentResultDTO result = new AssessmentResultDTO();
        result.setAssessmentId(assessmentId);
        result.setListeningScore(listeningScore);
        result.setReadingScore(readingScore);
        result.setWritingScore(writingScore);
        result.setSpeakingScore(speakingScore);
        result.setGrammarScore(grammarScore);
        result.setVocabularyScore(vocabularyScore);
        result.setOverallScore(overallScore);
        result.setOverallLevel(overallLevel);
        result.setTotalQuestions(totalQuestions);
        result.setCorrectAnswers(totalCorrect);

        return result;
    }

    private BigDecimal calculateSkillScore(String skillType, Map<String, BigDecimal> skillScores, Map<String, Integer> skillTotals) {
        BigDecimal totalScore = skillScores.getOrDefault(skillType, BigDecimal.ZERO);
        int totalQuestions = skillTotals.getOrDefault(skillType, 1);
        
        // Get total possible score for this skill
        List<AssessmentQuestion> questions = questionRepository
                .findBySkillTypeOrderByOrderIndexAsc(skillType)
                .stream()
                .limit(QUESTIONS_PER_SKILL)
                .collect(Collectors.toList());
        
        BigDecimal maxScore = questions.stream()
                .map(AssessmentQuestion::getScorePoints)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        if (maxScore.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        
        // Calculate percentage (0-100)
        return totalScore.divide(maxScore, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .setScale(2, RoundingMode.HALF_UP);
    }

    private AssessmentQuestionDTO convertToDTO(AssessmentQuestion question) {
        AssessmentQuestionDTO dto = new AssessmentQuestionDTO();
        dto.setQuestionId(question.getQuestionId());
        dto.setSkillType(question.getSkillType());
        dto.setQuestionType(question.getQuestionType());
        dto.setTextContent(question.getTextContent());
        dto.setAudioFileUrl(question.getAudioFileUrl());
        dto.setReadingPassage(question.getReadingPassage());
        dto.setScorePoints(question.getScorePoints());
        dto.setDifficultyLevel(question.getDifficultyLevel());
        dto.setOrderIndex(question.getOrderIndex());

        // Get options if multiple choice
        if ("MULTIPLE_CHOICE".equals(question.getQuestionType())) {
            List<AssessmentOption> options = optionRepository
                    .findByQuestionOrderByOrderIndexAsc(question);
            List<AssessmentOptionDTO> optionDTOs = options.stream()
                    .map(opt -> {
                        AssessmentOptionDTO optDTO = new AssessmentOptionDTO();
                        optDTO.setOptionId(opt.getOptionId());
                        optDTO.setOptionText(opt.getOptionText());
                        optDTO.setOrderIndex(opt.getOrderIndex());
                        return optDTO;
                    })
                    .collect(Collectors.toList());
            dto.setOptions(optionDTOs);
        }

        return dto;
    }

    private String determineLevel(BigDecimal score) {
        double scoreValue = score.doubleValue();
        if (scoreValue >= 80) return "ADVANCED";
        if (scoreValue >= 65) return "UPPER_INTERMEDIATE";
        if (scoreValue >= 50) return "INTERMEDIATE";
        if (scoreValue >= 35) return "ELEMENTARY";
        return "BEGINNER";
    }

    public LevelAssessment getAssessmentById(String id) {
        return assessmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment", "id", id));
    }

    public List<LevelAssessment> getUserAssessments(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return assessmentRepository.findByUser(user);
    }

    public LevelAssessment getLatestAssessment(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return assessmentRepository.findFirstByUserOrderByCompletedAtDesc(user)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment", "userId", userId));
    }

    // Admin methods for managing assessment questions
    @Transactional
    public AssessmentQuestion createAssessmentQuestion(AssessmentQuestionDTO dto) {
        AssessmentQuestion question = new AssessmentQuestion();
        question.setQuestionId(UUID.randomUUID().toString());
        question.setSkillType(dto.getSkillType());
        question.setQuestionType(dto.getQuestionType());
        question.setTextContent(dto.getTextContent());
        question.setAudioFileUrl(dto.getAudioFileUrl());
        question.setReadingPassage(dto.getReadingPassage());
        question.setScorePoints(dto.getScorePoints());
        question.setCorrectAnswerText(dto.getCorrectAnswerText());
        question.setDifficultyLevel(dto.getDifficultyLevel());
        question.setOrderIndex(dto.getOrderIndex());

        AssessmentQuestion saved = questionRepository.save(question);

        // Create options if multiple choice
        if ("MULTIPLE_CHOICE".equals(dto.getQuestionType()) && dto.getOptions() != null) {
            for (AssessmentOptionDTO optionDTO : dto.getOptions()) {
                AssessmentOption option = new AssessmentOption();
                option.setOptionId(UUID.randomUUID().toString());
                option.setQuestion(saved);
                option.setOptionText(optionDTO.getOptionText());
                option.setIsCorrect(optionDTO.getIsCorrect() != null ? optionDTO.getIsCorrect() : false);
                option.setOrderIndex(optionDTO.getOrderIndex());
                optionRepository.save(option);
            }
        }

        return saved;
    }

    public List<AssessmentQuestion> getAllAssessmentQuestions() {
        return questionRepository.findAll();
    }

    public List<AssessmentQuestion> getAssessmentQuestionsBySkill(String skillType) {
        return questionRepository.findBySkillTypeOrderByOrderIndexAsc(skillType);
    }

    public AssessmentQuestion getAssessmentQuestionById(String questionId) {
        return questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment Question", "id", questionId));
    }

    @Transactional
    public AssessmentQuestion updateAssessmentQuestion(String questionId, AssessmentQuestionDTO dto) {
        AssessmentQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment Question", "id", questionId));

        question.setSkillType(dto.getSkillType());
        question.setQuestionType(dto.getQuestionType());
        question.setTextContent(dto.getTextContent());
        question.setAudioFileUrl(dto.getAudioFileUrl());
        question.setReadingPassage(dto.getReadingPassage());
        question.setScorePoints(dto.getScorePoints());
        question.setCorrectAnswerText(dto.getCorrectAnswerText());
        question.setDifficultyLevel(dto.getDifficultyLevel());
        question.setOrderIndex(dto.getOrderIndex());

        // Update options if multiple choice
        if ("MULTIPLE_CHOICE".equals(dto.getQuestionType()) && dto.getOptions() != null) {
            // Delete existing options
            List<AssessmentOption> existingOptions = optionRepository.findByQuestionOrderByOrderIndexAsc(question);
            optionRepository.deleteAll(existingOptions);

            // Create new options
            for (AssessmentOptionDTO optionDTO : dto.getOptions()) {
                AssessmentOption option = new AssessmentOption();
                option.setOptionId(UUID.randomUUID().toString());
                option.setQuestion(question);
                option.setOptionText(optionDTO.getOptionText());
                option.setIsCorrect(optionDTO.getIsCorrect() != null ? optionDTO.getIsCorrect() : false);
                option.setOrderIndex(optionDTO.getOrderIndex());
                optionRepository.save(option);
            }
        }

        return questionRepository.save(question);
    }

    @Transactional
    public void deleteAssessmentQuestion(String questionId) {
        AssessmentQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment Question", "id", questionId));
        
        // Delete options first
        List<AssessmentOption> options = optionRepository.findByQuestionOrderByOrderIndexAsc(question);
        optionRepository.deleteAll(options);
        
        questionRepository.delete(question);
    }

    @Transactional
    public void createAssessmentTemplate(String templateName) {
        // Create a preset assessment template with sample questions
        // This is a simplified version - you can expand it
        String[] skills = {"LISTENING", "READING", "WRITING", "SPEAKING", "GRAMMAR", "VOCABULARY"};
        
        for (String skill : skills) {
            for (int i = 1; i <= QUESTIONS_PER_SKILL; i++) {
                AssessmentQuestion question = new AssessmentQuestion();
                question.setQuestionId(UUID.randomUUID().toString());
                question.setSkillType(skill);
                question.setQuestionType("MULTIPLE_CHOICE");
                question.setTextContent(templateName + " - " + skill + " Question " + i);
                question.setScorePoints(BigDecimal.valueOf(20.0));
                question.setDifficultyLevel("INTERMEDIATE");
                question.setOrderIndex(i);
                
                AssessmentQuestion saved = questionRepository.save(question);
                
                // Create 4 options
                for (int j = 1; j <= 4; j++) {
                    AssessmentOption option = new AssessmentOption();
                    option.setOptionId(UUID.randomUUID().toString());
                    option.setQuestion(saved);
                    option.setOptionText("Option " + (char)('A' + j - 1));
                    option.setIsCorrect(j == 1); // First option is correct
                    option.setOrderIndex(j);
                    optionRepository.save(option);
                }
            }
        }
    }
}


