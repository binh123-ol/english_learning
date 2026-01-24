package com.example.english.controller;

import com.example.english.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@Tag(name = "Analytics", description = "Learning analytics and statistics")
@SecurityRequirement(name = "bearerAuth")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping("/users/{userId}/statistics")
    @Operation(summary = "Get user statistics", description = "Get comprehensive learning statistics for a user")
    public ResponseEntity<Map<String, Object>> getUserStatistics(@PathVariable String userId) {
        return ResponseEntity.ok(analyticsService.getUserStatistics(userId));
    }

    @GetMapping("/users/{userId}/report")
    @Operation(summary = "Get progress report", description = "Get detailed progress report for a user")
    public ResponseEntity<Map<String, Object>> getProgressReport(@PathVariable String userId) {
        return ResponseEntity.ok(analyticsService.getProgressReport(userId));
    }
}


