package com.example.english.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "conversation_messages")
public class ConversationMessage {
    @Id
    @Column(name = "message_id")
    private String messageId;

    @ManyToOne
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;

    @Column(name = "sender_type", nullable = false)
    private String senderType; // USER, AI

    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "pronunciation_score", precision = 3, scale = 2)
    private java.math.BigDecimal pronunciationScore;

    @Column(name = "grammar_errors", columnDefinition = "TEXT")
    private String grammarErrors; // JSON array of errors

    @Column(name = "spelling_errors", columnDefinition = "TEXT")
    private String spellingErrors; // JSON array of errors

    @Column(name = "feedback", columnDefinition = "TEXT")
    private String feedback;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    // Getters and Setters
    public String getMessageId() {
        return messageId;
    }

    public void setMessageId(String messageId) {
        this.messageId = messageId;
    }

    public Conversation getConversation() {
        return conversation;
    }

    public void setConversation(Conversation conversation) {
        this.conversation = conversation;
    }

    public String getSenderType() {
        return senderType;
    }

    public void setSenderType(String senderType) {
        this.senderType = senderType;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public java.math.BigDecimal getPronunciationScore() {
        return pronunciationScore;
    }

    public void setPronunciationScore(java.math.BigDecimal pronunciationScore) {
        this.pronunciationScore = pronunciationScore;
    }

    public String getGrammarErrors() {
        return grammarErrors;
    }

    public void setGrammarErrors(String grammarErrors) {
        this.grammarErrors = grammarErrors;
    }

    public String getSpellingErrors() {
        return spellingErrors;
    }

    public void setSpellingErrors(String spellingErrors) {
        this.spellingErrors = spellingErrors;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }

    public LocalDateTime getSentAt() {
        return sentAt;
    }

    public void setSentAt(LocalDateTime sentAt) {
        this.sentAt = sentAt;
    }
}


