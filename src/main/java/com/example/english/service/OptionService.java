package com.example.english.service;

import com.example.english.entity.Option;
import com.example.english.entity.Question;
import com.example.english.repository.OptionRepository;
import com.example.english.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class OptionService {

    @Autowired
    private OptionRepository optionRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Transactional
    public Option createOption(Option option, String questionId) {
        Question question = questionRepository.findById(questionId).orElseThrow(() -> new RuntimeException("Question not found"));
        option.setOptionId(UUID.randomUUID().toString());
        option.setQuestion(question);
        return optionRepository.save(option);
    }

    public List<Option> getAllOptions() {
        return optionRepository.findAll();
    }

    public List<Option> getOptionsByQuestionId(String questionId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));
        return optionRepository.findByQuestion(question);
    }

    public Option getOptionById(String id) {
        return optionRepository.findById(id).orElseThrow(() -> new RuntimeException("Option not found"));
    }

    @Transactional
    public Option updateOption(String id, Option payload) {
        Option o = getOptionById(id);
        o.setOptionText(payload.getOptionText());
        o.setIsCorrect(payload.getIsCorrect());
        o.setExplanation(payload.getExplanation());
        return optionRepository.save(o);
    }

    @Transactional
    public void deleteOption(String id) {
        if (!optionRepository.existsById(id)) throw new RuntimeException("Option not found");
        optionRepository.deleteById(id);
    }
}
