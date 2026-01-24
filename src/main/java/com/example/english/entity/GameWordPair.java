package com.example.english.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "game_word_pairs")
public class GameWordPair {
    @Id
    @Column(name = "pair_id")
    private String pairId;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;

    @Column(name = "english_word", nullable = false)
    private String englishWord;

    @Column(name = "vietnamese_translation", nullable = false)
    private String vietnameseTranslation;

    @Column(name = "display_order")
    private Integer displayOrder;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (pairId == null) {
            pairId = java.util.UUID.randomUUID().toString();
        }
    }

    // Getters and Setters
    public String getPairId() {
        return pairId;
    }

    public void setPairId(String pairId) {
        this.pairId = pairId;
    }

    public Game getGame() {
        return game;
    }

    public void setGame(Game game) {
        this.game = game;
    }

    public String getEnglishWord() {
        return englishWord;
    }

    public void setEnglishWord(String englishWord) {
        this.englishWord = englishWord;
    }

    public String getVietnameseTranslation() {
        return vietnameseTranslation;
    }

    public void setVietnameseTranslation(String vietnameseTranslation) {
        this.vietnameseTranslation = vietnameseTranslation;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
