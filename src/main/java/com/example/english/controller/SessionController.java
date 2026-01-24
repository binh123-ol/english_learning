package com.example.english.controller;

import com.example.english.entity.Session;
import com.example.english.service.SessionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
@Tag(name = "Sessions", description = "Exam session management with automatic scoring")
@SecurityRequirement(name = "bearerAuth")
public class SessionController {

    @Autowired
    private SessionService sessionService;

    @PostMapping
    @Operation(summary = "Create exam session", description = "Start a new exam session for a user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Session created successfully"),
            @ApiResponse(responseCode = "404", description = "User or Exam not found")
    })
    public ResponseEntity<Session> createSession(@RequestParam String userId, @RequestParam String examId) {
        Session created = sessionService.createSession(userId, examId);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Session>> getAllSessions() {
        return ResponseEntity.ok(sessionService.getAllSessions());
    }

    @GetMapping("/exam/{examId}")
    @Operation(summary = "Get sessions by exam", description = "Get all sessions for a specific exam")
    @ApiResponse(responseCode = "200", description = "Sessions retrieved successfully")
    public ResponseEntity<List<Session>> getSessionsByExam(@PathVariable String examId) {
        return ResponseEntity.ok(sessionService.getSessionsByExam(examId));
    }

    @GetMapping("/users/{userId}")
    @Operation(summary = "Get sessions by user", description = "Get all exam sessions for a specific user")
    public ResponseEntity<List<Session>> getSessionsByUser(@PathVariable String userId) {
        return ResponseEntity.ok(sessionService.getSessionsByUser(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Session> getSession(@PathVariable String id) {
        return ResponseEntity.ok(sessionService.getSessionById(id));
    }

    @PostMapping("/{id}/finish")
    @Operation(summary = "Finish exam session", description = "Complete session and calculate final score, total correct answers, and band score (for IELTS)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Session finished and scored successfully"),
            @ApiResponse(responseCode = "400", description = "Session already finished"),
            @ApiResponse(responseCode = "404", description = "Session not found")
    })
    public ResponseEntity<Session> finishSession(@PathVariable String id) {
        Session finished = sessionService.finishSession(id);
        return ResponseEntity.ok(finished);
    }

    @GetMapping("/{id}/details")
    @Operation(summary = "Get session details with answers", description = "Get complete session information including all user answers for review")
    @ApiResponse(responseCode = "200", description = "Session details retrieved successfully")
    public ResponseEntity<SessionDetails> getSessionDetails(@PathVariable String id) {
        Session session = sessionService.getSessionById(id);
        // The answers will be fetched separately by the frontend using
        // /sessions/{id}/answers
        return ResponseEntity.ok(new SessionDetails(session));
    }

    // Inner class for detailed session response
    public static class SessionDetails {
        private Session session;

        public SessionDetails(Session session) {
            this.session = session;
        }

        public Session getSession() {
            return session;
        }

        public void setSession(Session session) {
            this.session = session;
        }
    }

    @GetMapping("/{id}/status")
    @Operation(summary = "Get session status", description = "Check if session is finished, expired, and get remaining time")
    @ApiResponse(responseCode = "200", description = "Session status retrieved")
    public ResponseEntity<SessionStatus> getSessionStatus(@PathVariable String id) {
        Session session = sessionService.getSessionById(id);
        boolean isExpired = sessionService.isSessionExpired(id);
        long remainingMinutes = sessionService.getRemainingMinutes(id);

        SessionStatus status = new SessionStatus(
                session.getSessionId(),
                session.getFinishedAt() != null,
                isExpired,
                remainingMinutes);

        return ResponseEntity.ok(status);
    }

    // Inner class for session status response
    public static class SessionStatus {
        private String sessionId;
        private boolean finished;
        private boolean expired;
        private long remainingMinutes;

        public SessionStatus(String sessionId, boolean finished, boolean expired, long remainingMinutes) {
            this.sessionId = sessionId;
            this.finished = finished;
            this.expired = expired;
            this.remainingMinutes = remainingMinutes;
        }

        public String getSessionId() {
            return sessionId;
        }

        public void setSessionId(String sessionId) {
            this.sessionId = sessionId;
        }

        public boolean isFinished() {
            return finished;
        }

        public void setFinished(boolean finished) {
            this.finished = finished;
        }

        public boolean isExpired() {
            return expired;
        }

        public void setExpired(boolean expired) {
            this.expired = expired;
        }

        public long getRemainingMinutes() {
            return remainingMinutes;
        }

        public void setRemainingMinutes(long remainingMinutes) {
            this.remainingMinutes = remainingMinutes;
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSession(@PathVariable String id) {
        sessionService.deleteSession(id);
        return ResponseEntity.noContent().build();
    }
}
