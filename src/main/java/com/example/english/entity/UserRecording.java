package com.example.english.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_recordings")
public class UserRecording {
    @Id
    @Column(name = "recording_id")
    private String recordingId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Lob
    @Column(name = "audio_data", nullable = false, columnDefinition = "LONGBLOB")
    private byte[] audioData;

    @Column(name = "content_type", nullable = false)
    private String contentType;

    @Enumerated(EnumType.STRING)
    @Column(name = "recording_type", nullable = false)
    private UserRecordingType recordingType;

    @Column(name = "reference_id", nullable = false)
    private String referenceId;

    @Column(name = "transcription", columnDefinition = "TEXT")
    private String transcription;

    @Column(name = "pronunciation_score", precision = 3, scale = 2)
    private BigDecimal pronunciationScore;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // Getters and Setters
    public String getRecordingId() {
        return recordingId;
    }

    public void setRecordingId(String recordingId) {
        this.recordingId = recordingId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public byte[] getAudioData() {
        return audioData;
    }

    public void setAudioData(byte[] audioData) {
        this.audioData = audioData;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public UserRecordingType getRecordingType() {
        return recordingType;
    }

    public void setRecordingType(UserRecordingType recordingType) {
        this.recordingType = recordingType;
    }

    public String getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(String referenceId) {
        this.referenceId = referenceId;
    }

    public String getTranscription() {
        return transcription;
    }

    public void setTranscription(String transcription) {
        this.transcription = transcription;
    }

    public BigDecimal getPronunciationScore() {
        return pronunciationScore;
    }

    public void setPronunciationScore(BigDecimal pronunciationScore) {
        this.pronunciationScore = pronunciationScore;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
