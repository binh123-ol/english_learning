package com.example.english.service;

import com.example.english.entity.Exam;
import com.example.english.entity.Session;
import com.example.english.entity.User;
import com.example.english.exception.ResourceNotFoundException;
import com.example.english.repository.ExamRepository;
import com.example.english.repository.SessionRepository;
import com.example.english.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ExamService {

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public Exam createExam(Exam exam) {
        exam.setExamId(UUID.randomUUID().toString());
        return examRepository.save(exam);
    }

    public List<Exam> getAllExams() {
        return examRepository.findAll();
    }

    public Exam getExamById(String id) {
        return examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam", "id", id));
    }

    @Transactional
    public Exam updateExam(String id, Exam payload) {
        Exam exam = getExamById(id);
        exam.setTitle(payload.getTitle());
        exam.setExamType(payload.getExamType());
        exam.setLevel(payload.getLevel());
        exam.setDurationMinutes(payload.getDurationMinutes());
        exam.setTotalScore(payload.getTotalScore());
        return examRepository.save(exam);
    }

    @Transactional
    public void deleteExam(String id) {
        if (!examRepository.existsById(id)) {
            throw new ResourceNotFoundException("Exam", "id", id);
        }
        examRepository.deleteById(id);
    }

    public List<Session> getUserExamSessions(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return sessionRepository.findByUserOrderByStartedAtDesc(user);
    }
}
