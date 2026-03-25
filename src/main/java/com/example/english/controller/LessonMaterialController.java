package com.example.english.controller;

import com.example.english.entity.LessonMaterial;
import com.example.english.service.LessonMaterialService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/sub-lessons")
@Tag(name = "Lesson Materials", description = "Lesson material management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class LessonMaterialController {

    @Autowired
    private LessonMaterialService materialService;

    @Autowired
    private ObjectMapper objectMapper;

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

    @PostMapping(value = "/{subLessonId}/materials", consumes = { "multipart/form-data" })
    @Operation(summary = "Create a new material")
    public ResponseEntity<LessonMaterial> createMaterial(
            @PathVariable String subLessonId, 
            @RequestPart("material") String materialJson,
            @RequestPart(value = "file", required = false) MultipartFile file) throws IOException {
        LessonMaterial material = objectMapper.readValue(materialJson, LessonMaterial.class);
        LessonMaterial created = materialService.createMaterial(subLessonId, material, file);
        return ResponseEntity.ok(created);
    }

    @PutMapping(value = "/materials/{materialId}", consumes = { "multipart/form-data" })
    @Operation(summary = "Update a material")
    public ResponseEntity<LessonMaterial> updateMaterial(
            @PathVariable String materialId, 
            @RequestPart("material") String materialJson,
            @RequestPart(value = "file", required = false) MultipartFile file) throws IOException {
        LessonMaterial material = objectMapper.readValue(materialJson, LessonMaterial.class);
        LessonMaterial updated = materialService.updateMaterial(materialId, material, file);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/materials/{materialId}/content")
    @Operation(summary = "Get material file content from database")
    public ResponseEntity<Resource> getMaterialContent(@PathVariable String materialId) {
        LessonMaterial material = materialService.getMaterialById(materialId);
        if (material.getFileContent() == null) {
            return ResponseEntity.notFound().build();
        }
        
        ByteArrayResource resource = new ByteArrayResource(material.getFileContent());
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(material.getContentType() != null ? material.getContentType() : "application/octet-stream"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + material.getFileName() + "\"")
                .body((Resource) resource);
    }

    @DeleteMapping("/materials/{materialId}")
    @Operation(summary = "Delete a material")
    public ResponseEntity<Void> deleteMaterial(@PathVariable String materialId) {
        materialService.deleteMaterial(materialId);
        return ResponseEntity.noContent().build();
    }
}

