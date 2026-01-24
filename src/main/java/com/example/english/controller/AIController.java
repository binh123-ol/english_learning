package com.example.english.controller;

import com.example.english.service.AIService;
import com.example.english.service.AIService.PronunciationAnalysis;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@Tag(name = "AI Services", description = "AI/NLP services for pronunciation, grammar, and spelling")
@SecurityRequirement(name = "bearerAuth")
public class AIController {

    @Autowired
    private AIService aiService;

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
    public ResponseEntity<Map<String, Object>> checkGrammar(@RequestBody TextRequest request) {
        List<Map<String, String>> errors = aiService.checkGrammar(request.getText());
        Map<String, Object> response = Map.of(
                "errors", errors,
                "errorCount", errors.size(),
                "text", request.getText()
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/spelling/check")
    @Operation(summary = "Check spelling", description = "Check spelling errors in text")
    public ResponseEntity<Map<String, Object>> checkSpelling(@RequestBody TextRequest request) {
        List<Map<String, String>> errors = aiService.checkSpelling(request.getText());
        Map<String, Object> response = Map.of(
                "errors", errors,
                "errorCount", errors.size(),
                "text", request.getText()
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/analyze")
    @Operation(summary = "Analyze text", description = "Comprehensive text analysis with grammar, spelling, and quality score")
    public ResponseEntity<Map<String, Object>> analyzeText(@RequestBody TextRequest request) {
        return ResponseEntity.ok(aiService.analyzeText(request.getText()));
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
}

