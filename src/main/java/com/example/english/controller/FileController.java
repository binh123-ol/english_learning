package com.example.english.controller;

import com.example.english.entity.User;
import com.example.english.entity.UserRecording;
import com.example.english.entity.UserRecordingType;
import com.example.english.repository.UserRecordingRepository;
import com.example.english.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.Principal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
@Tag(name = "File Management", description = "Endpoints for file uploads and downloads")
public class FileController {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Autowired
    private UserRecordingRepository recordingRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/upload/audio")
    @Operation(summary = "Upload audio file", description = "Upload an audio file (webm, mp3, wav)")
    public ResponseEntity<Map<String, String>> uploadAudio(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
        }

        try {
            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            } else {
                extension = ".webm"; // Default extension
            }
            
            String filename = UUID.randomUUID().toString() + extension;
            Path filePath = uploadPath.resolve(filename);

            // Save file
            Files.copy(file.getInputStream(), filePath);

            // Return relative URL for static resource handler
            String fileUrl = "/api/files/audio/" + filename;
            
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "url", fileUrl,
                "filename", filename
            ));

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to upload file: " + e.getMessage()));
        }
    }

    @PostMapping("/upload/recording")
    @Operation(summary = "Upload recording to database", description = "Upload an audio file and save it to the database for the current user")
    public ResponseEntity<Map<String, String>> uploadRecording(
            @RequestParam("file") MultipartFile file,
            @RequestParam("type") UserRecordingType type,
            @RequestParam("referenceId") String referenceId,
            Principal principal) {
        
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated"));
        }

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
        }

        try {
            User user = userRepository.findByEmail(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            UserRecording recording = new UserRecording();
            recording.setRecordingId(UUID.randomUUID().toString());
            recording.setUser(user);
            recording.setAudioData(file.getBytes());
            recording.setContentType(file.getContentType() != null ? file.getContentType() : "audio/webm");
            recording.setRecordingType(type);
            recording.setReferenceId(referenceId);
            recording.setCreatedAt(LocalDateTime.now());

            recordingRepository.save(recording);

            String fileUrl = "/api/files/recordings/" + recording.getRecordingId();

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "url", fileUrl,
                "recordingId", recording.getRecordingId()
            ));

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to save recording: " + e.getMessage()));
        }
    }

    @GetMapping("/recordings/{recordingId}")
    @Operation(summary = "Get recording from database", description = "Retrieve audio data from the database by recording ID")
    public ResponseEntity<Resource> getRecording(@PathVariable String recordingId) {
        return recordingRepository.findById(recordingId)
                .map(recording -> {
                    ByteArrayResource resource = new ByteArrayResource(recording.getAudioData());
                    return ResponseEntity.ok()
                            .contentType(MediaType.parseMediaType(recording.getContentType()))
                            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + recordingId + "\"")
                            .body((Resource) resource);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
