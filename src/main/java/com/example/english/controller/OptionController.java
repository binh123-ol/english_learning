package com.example.english.controller;

import com.example.english.entity.Option;
import com.example.english.service.OptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class OptionController {

    @Autowired
    private OptionService optionService;

    @GetMapping("/api/questions/{questionId}/options")
    public ResponseEntity<List<Option>> getOptionsByQuestion(@PathVariable String questionId) {
        return ResponseEntity.ok(optionService.getOptionsByQuestionId(questionId));
    }

    @PostMapping("/api/questions/{questionId}/options")
    public ResponseEntity<Option> createOption(@PathVariable String questionId, @RequestBody Option option) {
        Option created = optionService.createOption(option, questionId);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/api/options")
    public ResponseEntity<List<Option>> getAllOptions() {
        return ResponseEntity.ok(optionService.getAllOptions());
    }

    @GetMapping("/api/options/{id}")
    public ResponseEntity<Option> getOption(@PathVariable String id) {
        return ResponseEntity.ok(optionService.getOptionById(id));
    }

    @PutMapping("/api/options/{id}")
    public ResponseEntity<Option> updateOption(@PathVariable String id, @RequestBody Option payload) {
        return ResponseEntity.ok(optionService.updateOption(id, payload));
    }

    @DeleteMapping("/api/options/{id}")
    public ResponseEntity<Void> deleteOption(@PathVariable String id) {
        optionService.deleteOption(id);
        return ResponseEntity.noContent().build();
    }
}
