package com.example.english.service;

import com.example.english.entity.*;
import com.example.english.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class GameContentService {

    @Autowired
    private GameRepository gameRepository;

    @Autowired
    private GameWordPairRepository wordPairRepository;

    @Autowired
    private GameFlashcardRepository flashcardRepository;

    @Autowired
    private GameSpellingWordRepository spellingWordRepository;

    @Autowired
    private GameQuizQuestionRepository quizQuestionRepository;

    @Autowired
    private GamePuzzleRepository puzzleRepository;

    // ========== Word Match Methods ==========
    public List<com.example.english.dto.GameWordPairDTO> getWordPairs(String gameId) {
        System.out.println(">>> GameContentService.getWordPairs called with gameId: " + gameId);
        List<GameWordPair> entities = wordPairRepository.findByGame_GameIdOrderByDisplayOrderAsc(gameId);
        System.out.println(">>> Found " + entities.size() + " word pairs in database");

        List<com.example.english.dto.GameWordPairDTO> dtos = entities.stream()
                .map(e -> {
                    System.out.println(">>> Converting: " + e.getEnglishWord() + " - " + e.getVietnameseTranslation());
                    return new com.example.english.dto.GameWordPairDTO(
                            e.getPairId(),
                            e.getEnglishWord(),
                            e.getVietnameseTranslation(),
                            e.getDisplayOrder());
                })
                .collect(java.util.stream.Collectors.toList());

        System.out.println(">>> Returning " + dtos.size() + " DTOs");
        return dtos;
    }

    @Transactional
    public GameWordPair createWordPair(String gameId, GameWordPair wordPair) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Game not found"));
        wordPair.setGame(game);
        return wordPairRepository.save(wordPair);
    }

    @Transactional
    public GameWordPair updateWordPair(String pairId, GameWordPair wordPair) {
        GameWordPair existing = wordPairRepository.findById(pairId)
                .orElseThrow(() -> new RuntimeException("Word pair not found"));
        existing.setEnglishWord(wordPair.getEnglishWord());
        existing.setVietnameseTranslation(wordPair.getVietnameseTranslation());
        existing.setDisplayOrder(wordPair.getDisplayOrder());
        return wordPairRepository.save(existing);
    }

    @Transactional
    public void deleteWordPair(String pairId) {
        wordPairRepository.deleteById(pairId);
    }

    // ========== Flashcard Methods ==========
    public List<GameFlashcard> getFlashcards(String gameId) {
        return flashcardRepository.findByGame_GameIdOrderByDisplayOrderAsc(gameId);
    }

    @Transactional
    public GameFlashcard createFlashcard(String gameId, GameFlashcard flashcard) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Game not found"));
        flashcard.setGame(game);
        return flashcardRepository.save(flashcard);
    }

    @Transactional
    public GameFlashcard updateFlashcard(String cardId, GameFlashcard flashcard) {
        GameFlashcard existing = flashcardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Flashcard not found"));
        existing.setFront(flashcard.getFront());
        existing.setBack(flashcard.getBack());
        existing.setExample(flashcard.getExample());
        existing.setDisplayOrder(flashcard.getDisplayOrder());
        return flashcardRepository.save(existing);
    }

    @Transactional
    public void deleteFlashcard(String cardId) {
        flashcardRepository.deleteById(cardId);
    }

    // ========== Spelling Methods ==========
    public List<GameSpellingWord> getSpellingWords(String gameId) {
        return spellingWordRepository.findByGame_GameId(gameId);
    }

    @Transactional
    public GameSpellingWord createSpellingWord(String gameId, GameSpellingWord word) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Game not found"));
        word.setGame(game);
        return spellingWordRepository.save(word);
    }

    @Transactional
    public GameSpellingWord updateSpellingWord(String wordId, GameSpellingWord word) {
        GameSpellingWord existing = spellingWordRepository.findById(wordId)
                .orElseThrow(() -> new RuntimeException("Spelling word not found"));
        existing.setWord(word.getWord());
        existing.setHint(word.getHint());
        existing.setDifficulty(word.getDifficulty());
        return spellingWordRepository.save(existing);
    }

    @Transactional
    public void deleteSpellingWord(String wordId) {
        spellingWordRepository.deleteById(wordId);
    }

    // ========== Quiz Methods ==========
    public List<GameQuizQuestion> getQuizQuestions(String gameId) {
        return quizQuestionRepository.findByGame_GameId(gameId);
    }

    @Transactional
    public GameQuizQuestion createQuizQuestion(String gameId, GameQuizQuestion question) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Game not found"));
        question.setGame(game);
        return quizQuestionRepository.save(question);
    }

    @Transactional
    public GameQuizQuestion updateQuizQuestion(String questionId, GameQuizQuestion question) {
        GameQuizQuestion existing = quizQuestionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Quiz question not found"));
        existing.setQuestion(question.getQuestion());
        existing.setOptionA(question.getOptionA());
        existing.setOptionB(question.getOptionB());
        existing.setOptionC(question.getOptionC());
        existing.setOptionD(question.getOptionD());
        existing.setCorrectAnswer(question.getCorrectAnswer());
        existing.setExplanation(question.getExplanation());
        return quizQuestionRepository.save(existing);
    }

    @Transactional
    public void deleteQuizQuestion(String questionId) {
        quizQuestionRepository.deleteById(questionId);
    }

    // ========== Puzzle Methods ==========
    public List<GamePuzzle> getPuzzles(String gameId) {
        return puzzleRepository.findByGame_GameId(gameId);
    }

    @Transactional
    public GamePuzzle createPuzzle(String gameId, GamePuzzle puzzle) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Game not found"));
        puzzle.setGame(game);
        return puzzleRepository.save(puzzle);
    }

    @Transactional
    public GamePuzzle updatePuzzle(String puzzleId, GamePuzzle puzzle) {
        GamePuzzle existing = puzzleRepository.findById(puzzleId)
                .orElseThrow(() -> new RuntimeException("Puzzle not found"));
        existing.setSentence(puzzle.getSentence());
        existing.setHint(puzzle.getHint());
        existing.setPuzzleType(puzzle.getPuzzleType());
        return puzzleRepository.save(existing);
    }

    @Transactional
    public void deletePuzzle(String puzzleId) {
        puzzleRepository.deleteById(puzzleId);
    }

    // ========== Generic Get Content by Game Type ==========
    public Object getGameContent(String gameId, String gameType) {
        System.out.println(">>> getGameContent called: gameId=" + gameId + ", gameType=" + gameType);

        // For now, just return word pairs to avoid issues
        // TODO: Implement full switch when all DTOs are ready
        try {
            if (gameType == null) {
                System.out.println(">>> gameType is null, returning word pairs");
                return getWordPairs(gameId);
            }

            String type = gameType.toUpperCase().replace(" ", "_");
            System.out.println(">>> Normalized type: " + type);

            if (type.contains("WORD") || type.equals("WORD_MATCH")) {
                System.out.println(">>> Detected WORD_MATCH type");
                return getWordPairs(gameId);
            } else if (type.contains("FLASH")) {
                return getFlashcards(gameId);
            } else if (type.contains("SPELL")) {
                return getSpellingWords(gameId);
            } else if (type.contains("QUIZ")) {
                return getQuizQuestions(gameId);
            } else if (type.contains("PUZZLE")) {
                return getPuzzles(gameId);
            }

            // Default to word pairs
            System.out.println(">>> No match, defaulting to word pairs");
            return getWordPairs(gameId);
        } catch (Exception e) {
            // Log error and return empty list
            System.err.println("Error getting game content: " + e.getMessage());
            e.printStackTrace();
            return new java.util.ArrayList<>();
        }
    }
}
