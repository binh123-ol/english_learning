package com.example.english.controller;

import com.example.english.entity.User;
import com.example.english.entity.WritingEvaluation;
import com.example.english.repository.WritingEvaluationRepository;
import com.example.english.repository.UserRepository;
import com.example.english.service.AIService;
import com.example.english.service.AIService.PronunciationAnalysis;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/ai")
@Tag(name = "AI Services", description = "AI/NLP services for pronunciation, grammar, and spelling")
@SecurityRequirement(name = "bearerAuth")
public class AIController {

    @Autowired
    private AIService aiService;

    @Autowired
    private WritingEvaluationRepository writingEvaluationRepository;

    @Autowired
    private UserRepository userRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping("/pronunciation/score")
    @Operation(summary = "Score pronunciation", description = "Score pronunciation of spoken text")
    public ResponseEntity<Map<String, Object>> scorePronunciation(
            @RequestBody PronunciationRequest request) {
        PronunciationAnalysis analysis = aiService.analyzePronunciation(request.getText(), request.getAudioFileUrl());
        Map<String, Object> response = Map.of(
                "score", analysis.getScore(),
                "expectedText", analysis.getExpectedText(),
                "recognizedText", analysis.getRecognizedText(),
                "mispronouncedWords", analysis.getMispronouncedWords()
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/grammar/check")
    @Operation(summary = "Check grammar", description = "Check grammar errors in text")
    public ResponseEntity<?> checkGrammar(@RequestBody TextRequest request) {
        try {
            List<Map<String, String>> errors = aiService.checkGrammar(request.getText());
            Map<String, Object> response = new HashMap<>();
            response.put("errors", errors);
            response.put("errorCount", errors.size());
            response.put("text", request.getText());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Grammar check failed", "message", e.getMessage()));
        }
    }

    @PostMapping("/spelling/check")
    @Operation(summary = "Check spelling", description = "Check spelling errors in text")
    public ResponseEntity<?> checkSpelling(@RequestBody TextRequest request) {
        try {
            List<Map<String, String>> errors = aiService.checkSpelling(request.getText());
            Map<String, Object> response = new HashMap<>();
            response.put("errors", errors);
            response.put("errorCount", errors.size());
            response.put("text", request.getText());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Spelling check failed", "message", e.getMessage()));
        }
    }

    @PostMapping("/analyze")
    @Operation(summary = "Analyze text", description = "Comprehensive text analysis with grammar, spelling, and quality score")
    public ResponseEntity<?> analyzeText(@RequestBody TextRequest request) {
        try {
            return ResponseEntity.ok(aiService.analyzeText(request.getText()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Analysis failed", "message", e.getMessage()));
        }
    }

    @PostMapping("/chat")
    @Operation(summary = "AI Chat", description = "Context-aware AI English tutor chat")
    public ResponseEntity<?> chat(@RequestBody ChatRequest request) {
        try {
            String response = aiService.getChatResponse(request.getMessage(), request.getSystemPrompt());
            Map<String, String> responseMap = new HashMap<>();
            responseMap.put("response", response);
            return ResponseEntity.ok(responseMap);
        } catch (Exception e) {
            System.err.println("Chat error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "AI Chat failed", "message", e.getMessage()));
        }
    }

    @GetMapping("/ping")
    public ResponseEntity<?> ping() {
        try {
            String aiResponse = aiService.getSmartSpeechFeedback("Hello", null);
            return ResponseEntity.ok(Map.of("status", "ok", "aiResponse", aiResponse));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "error", "message", e.getMessage()));
        }
    }

    @PostMapping("/writing/evaluate")
    @Operation(summary = "Evaluate writing", description = "AI-powered writing evaluation with highlighting")
    public ResponseEntity<?> evaluateWriting(
            @RequestParam String userId,
            @RequestBody TextRequest request) {
        
        System.out.println("Received writing evaluation request for user: " + userId);
        try {
            String aiJson = aiService.evaluateWriting(request.getText());
            System.out.println("AI Response: " + aiJson);
            
            if (aiJson == null || aiJson.trim().isEmpty() || !aiJson.contains("{")) {
                throw new RuntimeException("AI returned invalid data: " + aiJson);
            }
            
            Map<String, Object> result = objectMapper.readValue(aiJson, new TypeReference<Map<String, Object>>() {});
            
            // Validate required fields
            if (!result.containsKey("topic") || !result.containsKey("score") || !result.containsKey("segments")) {
                throw new RuntimeException("AI response missing mandatory fields. Keys found: " + result.keySet());
            }
            
            // Save to database
            WritingEvaluation evaluation = new WritingEvaluation();
            evaluation.setEvaluationId(UUID.randomUUID().toString());
            
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                System.err.println("User not found: " + userId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "User not found", "userId", userId));
            }
            
            evaluation.setUser(user);
            evaluation.setContent(request.getText());
            evaluation.setTopic((String) result.get("topic"));
            evaluation.setLevel((String) result.get("level"));
            
            Object scoreObj = result.get("score");
            if (scoreObj instanceof Number) {
                evaluation.setScore(BigDecimal.valueOf(((Number) scoreObj).doubleValue()));
            } else if (scoreObj != null) {
                evaluation.setScore(new BigDecimal(scoreObj.toString()));
            }
            
            evaluation.setFeedback((String) result.get("feedback"));
            evaluation.setAnalysisJson(aiJson);
            evaluation.setCreatedAt(LocalDateTime.now());
            
            writingEvaluationRepository.save(evaluation);
            System.out.println("Evaluation saved successfully");
            
            // Add ID to result for frontend
            result.put("evaluationId", evaluation.getEvaluationId());
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Error evaluating writing: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to evaluate writing");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/writing/history/{userId}")
    @Operation(summary = "Get writing history", description = "Get all writing evaluations for a user")
    public ResponseEntity<List<WritingEvaluation>> getWritingHistory(@PathVariable String userId) {
        return ResponseEntity.ok(writingEvaluationRepository.findByUser_UserIdOrderByCreatedAtDesc(userId));
    }

    @GetMapping("/writing/{evaluationId}")
    @Operation(summary = "Get writing evaluation detail", description = "Get full detail of a specific writing evaluation")
    public ResponseEntity<WritingEvaluation> getWritingDetail(@PathVariable String evaluationId) {
        return writingEvaluationRepository.findById(evaluationId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Inner classes for request bodies
    public static class TextRequest {
        private String text;

        public String getText() { return text; }
        public void setText(String text) { this.text = text; }
    }

    public static class PronunciationRequest {
        private String text;
        private String audioFileUrl;

        public String getText() { return text; }
        public void setText(String text) { this.text = text; }
        public String getAudioFileUrl() { return audioFileUrl; }
        public void setAudioFileUrl(String audioFileUrl) { this.audioFileUrl = audioFileUrl; }
    }

    public static class ChatRequest {
        private String message;
        private String systemPrompt;

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public String getSystemPrompt() { return systemPrompt; }
        public void setSystemPrompt(String systemPrompt) { this.systemPrompt = systemPrompt; }
    }
}

