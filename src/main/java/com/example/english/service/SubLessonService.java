package com.example.english.service;

import com.example.english.entity.Lesson;
import com.example.english.entity.SubLesson;
import com.example.english.exception.ResourceNotFoundException;
import com.example.english.repository.LessonRepository;
import com.example.english.repository.SubLessonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class SubLessonService {

    @Autowired
    private SubLessonRepository subLessonRepository;

    @Autowired
    private LessonRepository lessonRepository;

    public List<SubLesson> getSubLessonsByLessonId(String lessonId) {
        return subLessonRepository.findByLessonLessonIdOrderByOrderIndexAsc(lessonId);
    }

    public SubLesson getSubLessonById(String subLessonId) {
        return subLessonRepository.findById(subLessonId)
                .orElseThrow(() -> new ResourceNotFoundException("SubLesson", "id", subLessonId));
    }

    @Transactional
    public SubLesson createSubLesson(String lessonId, SubLesson subLesson) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", "id", lessonId));

        subLesson.setSubLessonId(UUID.randomUUID().toString());
        subLesson.setLesson(lesson);
        subLesson.setCreatedAt(LocalDateTime.now());
        if (subLesson.getIsActive() == null) {
            subLesson.setIsActive(true);
        }

        return subLessonRepository.save(subLesson);
    }

    @Transactional
    public SubLesson updateSubLesson(String subLessonId, SubLesson subLesson) {
        SubLesson existing = getSubLessonById(subLessonId);
        existing.setTitle(subLesson.getTitle());
        existing.setContent(subLesson.getContent());
        existing.setOrderIndex(subLesson.getOrderIndex());
        existing.setIsActive(subLesson.getIsActive());
        return subLessonRepository.save(existing);
    }

    @Transactional
    public void deleteSubLesson(String subLessonId) {
        SubLesson subLesson = getSubLessonById(subLessonId);
        subLessonRepository.delete(subLesson);
    }
}




