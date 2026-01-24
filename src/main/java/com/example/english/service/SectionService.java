package com.example.english.service;

import com.example.english.dto.SectionDTO;
import com.example.english.entity.Section;
import com.example.english.entity.Exam;
import com.example.english.exception.ResourceNotFoundException;
import com.example.english.repository.SectionRepository;
import com.example.english.repository.ExamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class SectionService {

    @Autowired
    private SectionRepository sectionRepository;

    @Autowired
    private ExamRepository examRepository;

    @Transactional
    public Section createSection(SectionDTO dto) {
        Exam exam = examRepository.findById(dto.getExamId())
                .orElseThrow(() -> new ResourceNotFoundException("Exam", "id", dto.getExamId()));
        
        Section section = new Section();
        section.setSectionId(UUID.randomUUID().toString());
        section.setExam(exam);
        section.setTitle(dto.getTitle());
        section.setInstructionText(dto.getInstructionText());
        section.setMediaUrl(dto.getMediaUrl());
        
        // Set orderIndex, default to 1 if not provided
        if (dto.getOrderIndex() != null) {
            section.setOrderIndex(dto.getOrderIndex());
        } else {
            // Get the max order index for this exam and add 1
            List<Section> existingSections = sectionRepository.findByExam(exam);
            int maxOrder = existingSections.stream()
                    .mapToInt(s -> s.getOrderIndex() != null ? s.getOrderIndex() : 0)
                    .max()
                    .orElse(0);
            section.setOrderIndex(maxOrder + 1);
        }
        
        return sectionRepository.save(section);
    }

    public List<Section> getAllSections() {
        return sectionRepository.findAll();
    }

    public Section getSectionById(String id) {
        return sectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Section", "id", id));
    }

    public List<Section> getSectionsByExam(String examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam", "id", examId));
        return sectionRepository.findByExam(exam);
    }

    @Transactional
    public Section updateSection(String id, SectionDTO dto) {
        Section section = getSectionById(id);
        section.setTitle(dto.getTitle());
        section.setInstructionText(dto.getInstructionText());
        section.setMediaUrl(dto.getMediaUrl());
        section.setOrderIndex(dto.getOrderIndex());
        return sectionRepository.save(section);
    }

    @Transactional
    public void deleteSection(String id) {
        if (!sectionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Section", "id", id);
        }
        sectionRepository.deleteById(id);
    }
}
