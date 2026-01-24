package com.example.english.dto;

public class GameWordPairDTO {
    private String pairId;
    private String englishWord;
    private String vietnameseTranslation;
    private Integer displayOrder;

    // Constructors
    public GameWordPairDTO() {
    }

    public GameWordPairDTO(String pairId, String englishWord, String vietnameseTranslation, Integer displayOrder) {
        this.pairId = pairId;
        this.englishWord = englishWord;
        this.vietnameseTranslation = vietnameseTranslation;
        this.displayOrder = displayOrder;
    }

    // Getters and Setters
    public String getPairId() {
        return pairId;
    }

    public void setPairId(String pairId) {
        this.pairId = pairId;
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
}
