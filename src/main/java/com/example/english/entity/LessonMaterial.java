package com.example.english.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "lesson_materials")
public class LessonMaterial {
    @Id
    @Column(name = "material_id")
    private String materialId;

    @ManyToOne
    @JoinColumn(name = "sub_lesson_id", nullable = false)
    private SubLesson subLesson;

    @Column(name = "material_type", nullable = false)
    private String materialType; // TEXT, VIDEO, AUDIO, PDF, IMAGE

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "file_url", length = 500)
    private String fileUrl;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Getters and Setters
    public String getMaterialId() {
        return materialId;
    }

    public void setMaterialId(String materialId) {
        this.materialId = materialId;
    }

    public SubLesson getSubLesson() {
        return subLesson;
    }

    public void setSubLesson(SubLesson subLesson) {
        this.subLesson = subLesson;
    }

    public String getMaterialType() {
        return materialType;
    }

    public void setMaterialType(String materialType) {
        this.materialType = materialType;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public Integer getOrderIndex() {
        return orderIndex;
    }

    public void setOrderIndex(Integer orderIndex) {
        this.orderIndex = orderIndex;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}




