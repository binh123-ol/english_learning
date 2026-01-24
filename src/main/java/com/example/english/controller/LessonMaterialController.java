package com.example.english.controller;

import com.example.english.entity.LessonMaterial;
import com.example.english.service.LessonMaterialService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sub-lessons")
@Tag(name = "Lesson Materials", description = "Lesson material management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class LessonMaterialController {

    @Autowired
    private LessonMaterialService materialService;

    @GetMapping("/{subLessonId}/materials")
    @Operation(summary = "Get all materials for a sub-lesson")
    public ResponseEntity<List<LessonMaterial>> getMaterialsBySubLessonId(@PathVariable String subLessonId) {
        List<LessonMaterial> materials = materialService.getMaterialsBySubLessonId(subLessonId);
        return ResponseEntity.ok(materials);
    }

    @GetMapping("/materials/{materialId}")
    @Operation(summary = "Get material by ID")
    public ResponseEntity<LessonMaterial> getMaterialById(@PathVariable String materialId) {
        LessonMaterial material = materialService.getMaterialById(materialId);
        return ResponseEntity.ok(material);
    }

    @PostMapping("/{subLessonId}/materials")
    @Operation(summary = "Create a new material")
    public ResponseEntity<LessonMaterial> createMaterial(@PathVariable String subLessonId, @RequestBody LessonMaterial material) {
        LessonMaterial created = materialService.createMaterial(subLessonId, material);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/materials/{materialId}")
    @Operation(summary = "Update a material")
    public ResponseEntity<LessonMaterial> updateMaterial(@PathVariable String materialId, @RequestBody LessonMaterial material) {
        LessonMaterial updated = materialService.updateMaterial(materialId, material);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/materials/{materialId}")
    @Operation(summary = "Delete a material")
    public ResponseEntity<Void> deleteMaterial(@PathVariable String materialId) {
        materialService.deleteMaterial(materialId);
        return ResponseEntity.noContent().build();
    }
}

