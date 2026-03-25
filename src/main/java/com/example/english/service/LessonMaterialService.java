package com.example.english.service;

import com.example.english.entity.LessonMaterial;
import com.example.english.entity.SubLesson;
import com.example.english.exception.ResourceNotFoundException;
import com.example.english.repository.LessonMaterialRepository;
import com.example.english.repository.SubLessonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class LessonMaterialService {

    @Autowired
    private LessonMaterialRepository materialRepository;

    @Autowired
    private SubLessonRepository subLessonRepository;

    public List<LessonMaterial> getMaterialsBySubLessonId(String subLessonId) {
        return materialRepository.findBySubLessonSubLessonIdOrderByOrderIndexAsc(subLessonId);
    }

    public LessonMaterial getMaterialById(String materialId) {
        return materialRepository.findById(materialId)
                .orElseThrow(() -> new ResourceNotFoundException("LessonMaterial", "id", materialId));
    }

    @Transactional
    public LessonMaterial createMaterial(String subLessonId, LessonMaterial material, MultipartFile file) throws IOException {
        SubLesson subLesson = subLessonRepository.findById(subLessonId)
                .orElseThrow(() -> new ResourceNotFoundException("SubLesson", "id", subLessonId));

        material.setMaterialId(UUID.randomUUID().toString());
        material.setSubLesson(subLesson);
        material.setCreatedAt(LocalDateTime.now());

        if (file != null && !file.isEmpty()) {
            material.setFileContent(file.getBytes());
            material.setFileName(file.getOriginalFilename());
            material.setContentType(file.getContentType());
            // Optionally set fileUrl for static serving if needed, 
            // but since we want to store in DB, we'll provide a separate download URL
            material.setFileUrl("/api/sub-lessons/materials/" + material.getMaterialId() + "/content");
        }

        return materialRepository.save(material);
    }

    @Transactional
    public LessonMaterial updateMaterial(String materialId, LessonMaterial material, MultipartFile file) throws IOException {
        LessonMaterial existing = getMaterialById(materialId);
        existing.setMaterialType(material.getMaterialType());
        existing.setTitle(material.getTitle());
        existing.setContent(material.getContent());
        existing.setOrderIndex(material.getOrderIndex());

        if (file != null && !file.isEmpty()) {
            existing.setFileContent(file.getBytes());
            existing.setFileName(file.getOriginalFilename());
            existing.setContentType(file.getContentType());
            existing.setFileUrl("/api/sub-lessons/materials/" + materialId + "/content");
        } else if (material.getFileUrl() != null) {
            // Keep existing URL if provided
            existing.setFileUrl(material.getFileUrl());
        }

        return materialRepository.save(existing);
    }

    @Transactional
    public void deleteMaterial(String materialId) {
        LessonMaterial material = getMaterialById(materialId);
        materialRepository.delete(material);
    }
}

