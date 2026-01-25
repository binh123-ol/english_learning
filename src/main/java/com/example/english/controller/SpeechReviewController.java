package com.example.english.controller;

import com.example.english.service.AIService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/speech")
@Tag(name = "Speech Review", description = "AI-powered speech analysis and correction")
public class SpeechReviewController {

    @Autowired
    private AIService aiService;

    @PostMapping("/analyze")
    @Operation(summary = "Analyze speech", description = "Get AI feedback for a spoken sentence")
    public ResponseEntity<Map<String, String>> analyzeSpeech(@RequestBody AnalyzeRequest request) {
        String feedback = aiService.getSmartSpeechFeedback(request.getText(), request.getDetails());
        return ResponseEntity.ok(Map.of("feedback", feedback));
    }

    public static class AnalyzeRequest {
        private String text;
        private List<AIService.WordDetail> details;

        public String getText() {
            return text;
        }

        public void setText(String text) {
            this.text = text;
        }

        public List<AIService.WordDetail> getDetails() {
            return details;
        }

        public void setDetails(List<AIService.WordDetail> details) {
            this.details = details;
        }
    }
}
