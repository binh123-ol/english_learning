package com.example.english.repository;

import com.example.english.entity.LessonMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonMaterialRepository extends JpaRepository<LessonMaterial, String> {
    List<LessonMaterial> findBySubLessonSubLessonIdOrderByOrderIndexAsc(String subLessonId);
}




