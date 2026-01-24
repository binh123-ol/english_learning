package com.example.english.controller;

import com.example.english.entity.Conversation;
import com.example.english.entity.ConversationMessage;
import com.example.english.service.ConversationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/conversations")
@Tag(name = "Conversations", description = "AI conversation practice for speaking")
@SecurityRequirement(name = "bearerAuth")
public class ConversationController {

    @Autowired
    private ConversationService conversationService;

    @PostMapping("/users/{userId}/start")
    @Operation(summary = "Start conversation", description = "Start a new AI conversation session")
    public ResponseEntity<Conversation> startConversation(
            @PathVariable String userId,
            @RequestBody ConversationRequest request) {
        Conversation conversation = conversationService.startConversation(
                userId,
                request.getTopic(),
                request.getDifficultyLevel()
        );
        return new ResponseEntity<>(conversation, HttpStatus.CREATED);
    }

    @PostMapping("/{conversationId}/messages")
    @Operation(summary = "Send message", description = "Send a message in conversation with AI feedback")
    public ResponseEntity<ConversationMessage> sendMessage(
            @PathVariable String conversationId,
            @RequestBody MessageRequest request) {
        ConversationMessage message = conversationService.sendMessage(
                conversationId,
                request.getMessage(),
                request.getAudioFileUrl()
        );
        return new ResponseEntity<>(message, HttpStatus.CREATED);
    }

    @PostMapping("/{conversationId}/end")
    @Operation(summary = "End conversation", description = "End a conversation session")
    public ResponseEntity<Conversation> endConversation(@PathVariable String conversationId) {
        return ResponseEntity.ok(conversationService.endConversation(conversationId));
    }

    @GetMapping("/users/{userId}")
    @Operation(summary = "Get user conversations", description = "Get all conversations for a user")
    public ResponseEntity<List<Conversation>> getUserConversations(@PathVariable String userId) {
        return ResponseEntity.ok(conversationService.getUserConversations(userId));
    }

    @GetMapping("/{conversationId}/messages")
    @Operation(summary = "Get conversation messages", description = "Get all messages in a conversation")
    public ResponseEntity<List<ConversationMessage>> getConversationMessages(@PathVariable String conversationId) {
        return ResponseEntity.ok(conversationService.getConversationMessages(conversationId));
    }

    // Inner classes for request bodies
    public static class ConversationRequest {
        private String topic;
        private String difficultyLevel;

        public String getTopic() { return topic; }
        public void setTopic(String topic) { this.topic = topic; }
        public String getDifficultyLevel() { return difficultyLevel; }
        public void setDifficultyLevel(String difficultyLevel) { this.difficultyLevel = difficultyLevel; }
    }

    public static class MessageRequest {
        private String message;
        private String audioFileUrl;

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public String getAudioFileUrl() { return audioFileUrl; }
        public void setAudioFileUrl(String audioFileUrl) { this.audioFileUrl = audioFileUrl; }
    }
}


