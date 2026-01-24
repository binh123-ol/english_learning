package com.example.english.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "sections")
public class Section {
    @Id
    @Column(name = "section_id")
    private String sectionId;

    @ManyToOne
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;

    @Column(nullable = false)
    private String title;

    @Column(name = "instruction_text", columnDefinition = "TEXT")
    private String instructionText;

    @Column(name = "media_url")
    private String mediaUrl;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    // Getters and Setters
    public String getSectionId() {
        return sectionId;
    }

    public void setSectionId(String sectionId) {
        this.sectionId = sectionId;
    }

    public Exam getExam() {
        return exam;
    }

    public void setExam(Exam exam) {
        this.exam = exam;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getInstructionText() {
        return instructionText;
    }

    public void setInstructionText(String instructionText) {
        this.instructionText = instructionText;
    }

    public String getMediaUrl() {
        return mediaUrl;
    }

    public void setMediaUrl(String mediaUrl) {
        this.mediaUrl = mediaUrl;
    }

    public Integer getOrderIndex() {
        return orderIndex;
    }

    public void setOrderIndex(Integer orderIndex) {
        this.orderIndex = orderIndex;
    }
}