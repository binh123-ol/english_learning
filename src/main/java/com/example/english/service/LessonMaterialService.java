package com.example.english.service;

import com.example.english.entity.LessonMaterial;
import com.example.english.entity.SubLesson;
import com.example.english.exception.ResourceNotFoundException;
import com.example.english.repository.LessonMaterialRepository;
import com.example.english.repository.SubLessonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    public LessonMaterial createMaterial(String subLessonId, LessonMaterial material) {
        SubLesson subLesson = subLessonRepository.findById(subLessonId)
                .orElseThrow(() -> new ResourceNotFoundException("SubLesson", "id", subLessonId));

        material.setMaterialId(UUID.randomUUID().toString());
        material.setSubLesson(subLesson);
        material.setCreatedAt(LocalDateTime.now());

        return materialRepository.save(material);
    }

    @Transactional
    public LessonMaterial updateMaterial(String materialId, LessonMaterial material) {
        LessonMaterial existing = getMaterialById(materialId);
        existing.setMaterialType(material.getMaterialType());
        existing.setTitle(material.getTitle());
        existing.setContent(material.getContent());
        existing.setFileUrl(material.getFileUrl());
        existing.setOrderIndex(material.getOrderIndex());
        return materialRepository.save(existing);
    }

    @Transactional
    public void deleteMaterial(String materialId) {
        LessonMaterial material = getMaterialById(materialId);
        materialRepository.delete(material);
    }
}

