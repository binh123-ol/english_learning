package com.example.english.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
@Tag(name = "File Upload", description = "File upload endpoints for audio and other files")
@SecurityRequirement(name = "bearerAuth")
public class FileUploadController {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @PostMapping("/upload/audio")
    @Operation(summary = "Upload audio file", description = "Upload an audio file and return the URL")
    public ResponseEntity<Map<String, String>> uploadAudio(@RequestParam("file") MultipartFile file) {
        Map<String, String> response = new HashMap<>();
        
        if (file.isEmpty()) {
            response.put("error", "File is empty");
            return ResponseEntity.badRequest().body(response);
        }

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("audio/")) {
            response.put("error", "File must be an audio file");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".") 
                ? originalFilename.substring(originalFilename.lastIndexOf(".")) 
                : ".mp3";
            String filename = UUID.randomUUID().toString() + extension;
            Path filePath = uploadPath.resolve(filename);

            // Save file
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Return file URL (adjust based on your server configuration)
            String fileUrl = "/api/files/audio/" + filename;
            response.put("url", fileUrl);
            response.put("filename", filename);
            
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            response.put("error", "Failed to upload file: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/audio/{filename}")
    @Operation(summary = "Get audio file", description = "Retrieve an uploaded audio file")
    public ResponseEntity<org.springframework.core.io.Resource> getAudioFile(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(filename).normalize();
            java.net.URI uri = filePath.toUri();
            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(uri);
            
            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                    .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, "audio/mpeg")
                    .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}

