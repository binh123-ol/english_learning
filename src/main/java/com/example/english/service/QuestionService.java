package com.example.english.service;

import com.example.english.dto.QuestionDTO;
import com.example.english.entity.Question;
import com.example.english.entity.Section;
import com.example.english.exception.ResourceNotFoundException;
import com.example.english.repository.QuestionRepository;
import com.example.english.repository.SectionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class QuestionService {

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private SectionRepository sectionRepository;

    @Transactional
    public Question createQuestion(QuestionDTO dto) {
        Section section = sectionRepository.findById(dto.getSectionId())
                .orElseThrow(() -> new ResourceNotFoundException("Section", "id", dto.getSectionId()));
        
        Question question = new Question();
        question.setQuestionId(UUID.randomUUID().toString());
        question.setSection(section);
        question.setQuestionType(dto.getQuestionType());
        question.setSkillType(dto.getSkillType());
        question.setTextContent(dto.getTextContent());
        question.setScorePoints(dto.getScorePoints());
        question.setCorrectAnswerText(dto.getCorrectAnswerText());
        
        return questionRepository.save(question);
    }

    public List<Question> getAllQuestions() {
        return questionRepository.findAll();
    }

    public Question getQuestionById(String id) {
        return questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question", "id", id));
    }

    public List<Question> getQuestionsBySection(String sectionId) {
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Section", "id", sectionId));
        return questionRepository.findBySection(section);
    }

    @Transactional
    public Question updateQuestion(String id, QuestionDTO dto) {
        Question q = getQuestionById(id);
        q.setQuestionType(dto.getQuestionType());
        q.setSkillType(dto.getSkillType());
        q.setTextContent(dto.getTextContent());
        q.setScorePoints(dto.getScorePoints());
        q.setCorrectAnswerText(dto.getCorrectAnswerText());
        return questionRepository.save(q);
    }

    @Transactional
    public void deleteQuestion(String id) {
        if (!questionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Question", "id", id);
        }
        questionRepository.deleteById(id);
    }
}
