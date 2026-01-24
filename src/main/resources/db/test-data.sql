-- ============================================
-- Test Data for English Learning Platform
-- This file is automatically loaded by Spring Boot in dev profile
-- 
-- This file includes:
--   - All lessons from database/sample-data.sql
--   - All games from database/sample-data.sql
--   - All exams with full sections/questions/options
--   - DELETE statements for clean reset
--
-- Note: This file has been merged with database/sample-data.sql
--       All sample data is now centralized here
-- ============================================

-- Clear existing data (important for dev/testing)
DELETE FROM user_answers;
DELETE FROM options;
DELETE FROM questions;
DELETE FROM sections;
DELETE FROM exams;
DELETE FROM learning_paths;
DELETE FROM user_progress;
DELETE FROM game_sessions;
DELETE FROM conversation_messages;
DELETE FROM conversations;
DELETE FROM games;
DELETE FROM lessons;

-- ============================================
-- 1. INSERT LESSONS (New Feature)
-- ============================================
INSERT INTO lessons (lesson_id, title, lesson_type, level, description, content, estimated_duration_minutes, xp_reward, difficulty_level, order_index, is_active) VALUES
('LESSON-001', 'Present Simple Tense', 'GRAMMAR', 'BEGINNER', 'Learn the basics of present simple tense', 'The present simple tense is used to describe habits, facts, and general truths...', 20, 10, 'EASY', 1, TRUE),
('LESSON-002', 'Past Simple Tense', 'GRAMMAR', 'BEGINNER', 'Master the past simple tense', 'The past simple tense is used to talk about completed actions in the past...', 25, 15, 'EASY', 2, TRUE),
('LESSON-003', 'Present Continuous', 'GRAMMAR', 'ELEMENTARY', 'Learn present continuous tense', 'The present continuous tense describes actions happening now...', 20, 10, 'MEDIUM', 3, TRUE),
('LESSON-004', 'Basic Vocabulary: Family', 'VOCABULARY', 'BEGINNER', 'Learn family-related vocabulary', 'mother, father, sister, brother, grandmother, grandfather...', 15, 8, 'EASY', 4, TRUE),
('LESSON-005', 'Vocabulary: Daily Activities', 'VOCABULARY', 'ELEMENTARY', 'Learn vocabulary for daily routines', 'wake up, brush teeth, have breakfast, go to work...', 15, 8, 'MEDIUM', 5, TRUE),
('LESSON-006', 'Listening Practice: Introduction', 'LISTENING', 'BEGINNER', 'Practice listening to basic introductions', 'Audio content: Listen and understand simple introductions...', 15, 10, 'EASY', 6, TRUE),
('LESSON-007', 'Reading: Short Stories', 'READING', 'ELEMENTARY', 'Read and understand short stories', 'Practice reading comprehension with simple stories...', 20, 12, 'MEDIUM', 7, TRUE),
('LESSON-008', 'Writing: Emails', 'WRITING', 'INTERMEDIATE', 'Learn to write professional emails', 'How to write effective emails in English...', 30, 20, 'MEDIUM', 8, TRUE),
('LESSON-009', 'Speaking: Self Introduction', 'SPEAKING', 'BEGINNER', 'Practice introducing yourself', 'Learn phrases to introduce yourself in English...', 15, 10, 'EASY', 9, TRUE),
('LESSON-010', 'Grammar: Conditional Sentences', 'GRAMMAR', 'INTERMEDIATE', 'Master conditional sentences', 'Learn about first, second, and third conditionals...', 30, 25, 'HARD', 10, TRUE);

-- ============================================
-- 2. INSERT GAMES (New Feature)
-- ============================================
INSERT INTO games (game_id, title, game_type, level, description, xp_reward, difficulty_level, estimated_duration_minutes, is_active, created_at) VALUES
('GAME-001', 'Word Match', 'WORD_MATCH', 'BEGINNER', 'Match words with their meanings', 5, 'EASY', 5, TRUE, NOW()),
('GAME-002', 'Grammar Quiz', 'QUIZ', 'ELEMENTARY', 'Test your grammar knowledge', 10, 'MEDIUM', 10, TRUE, NOW()),
('GAME-003', 'Flashcard Challenge', 'FLASHCARD', 'INTERMEDIATE', 'Learn vocabulary with flashcards', 8, 'MEDIUM', 8, TRUE, NOW()),
('GAME-004', 'Spelling Bee', 'SPELLING', 'ELEMENTARY', 'Test your spelling skills', 7, 'MEDIUM', 7, TRUE, NOW()),
('GAME-005', 'Sentence Puzzle', 'PUZZLE', 'INTERMEDIATE', 'Rearrange words to form sentences', 12, 'HARD', 12, TRUE, NOW()),
('GAME-006', 'Vocabulary Builder', 'WORD_MATCH', 'ADVANCED', 'Advanced vocabulary matching game', 15, 'HARD', 15, TRUE, NOW());

-- ============================================
-- 3. INSERT EXAMS (Existing Feature - Full Data)
-- ============================================
INSERT INTO exams (exam_id, title, exam_type, level, duration_minutes, total_score) VALUES
('IELTS1', 'IELTS Mock Test 1', 'PRACTICE', 'ADVANCED', 180, 200),
('GRAM1', 'Basic English Grammar', 'PRACTICE', 'BEGINNER', 45, 100),
('GRAM2', 'Intermediate Grammar Challenge', 'PRACTICE', 'INTERMEDIATE', 60, 100),
('BUS1', 'Business English Essentials', 'PRACTICE', 'INTERMEDIATE', 45, 100),
('EXP1', 'Common English Expressions', 'PRACTICE', 'BEGINNER', 30, 50),
('VOC1', 'Advanced Vocabulary Test', 'PRACTICE', 'ADVANCED', 45, 100),
('TOEIC1', 'TOEIC Practice - Part 1', 'PRACTICE', 'INTERMEDIATE', 120, 200),
('ACAD1', 'Academic Writing Skills', 'PRACTICE', 'ADVANCED', 60, 100),
('TRAV1', 'English for Travel', 'PRACTICE', 'BEGINNER', 30, 50),
('PROF1', 'Professional Communication', 'PRACTICE', 'INTERMEDIATE', 45, 100);

-- Insert Sections for IELTS Mock Test
INSERT INTO sections (section_id, exam_id, title, instruction_text, order_index) VALUES
('IELTS1-L', 'IELTS1', 'Listening', 'Test your English listening comprehension', 1),
('IELTS1-R', 'IELTS1', 'Reading', 'Academic reading comprehension', 2);

-- Insert Questions for Basic English Grammar
INSERT INTO questions (question_id, section_id, text_content, question_type, score_points) VALUES
('GRAM1-Q1', 'IELTS1-L', 'Choose the correct form of the verb: "She _____ to work every day."', 'MULTIPLE_CHOICE', 1.0);

-- Insert Options
INSERT INTO options (option_id, question_id, option_text, is_correct) VALUES
('GRAM1-Q1-O1', 'GRAM1-Q1', 'go', false),
('GRAM1-Q1-O2', 'GRAM1-Q1', 'goes', true),
('GRAM1-Q1-O3', 'GRAM1-Q1', 'going', false);

-- Business English Section
INSERT INTO sections (section_id, exam_id, title, instruction_text, order_index) VALUES
('BUS1-S1', 'BUS1', 'Email Writing', 'Professional email writing skills', 1);

INSERT INTO questions (question_id, section_id, text_content, question_type, score_points) VALUES
('BUS1-Q1', 'BUS1-S1', 'Which of the following is the most appropriate way to start a formal business email?', 'MULTIPLE_CHOICE', 1.0);

INSERT INTO options (option_id, question_id, option_text, is_correct) VALUES
('BUS1-Q1-O1', 'BUS1-Q1', 'Dear Sir/Madam,', true),
('BUS1-Q1-O2', 'BUS1-Q1', 'Hi there!', false),
('BUS1-Q1-O3', 'BUS1-Q1', 'Hey,', false);

-- Common English Expressions Section
INSERT INTO sections (section_id, exam_id, title, instruction_text, order_index) VALUES
('EXP1-S1', 'EXP1', 'Everyday Phrases', 'Common expressions used in daily conversations', 1);

INSERT INTO questions (question_id, section_id, text_content, question_type, score_points) VALUES
('EXP1-Q1', 'EXP1-S1', 'What does the expression "It\'s raining cats and dogs" mean?', 'MULTIPLE_CHOICE', 1.0);

INSERT INTO options (option_id, question_id, option_text, is_correct) VALUES
('EXP1-Q1-O1', 'EXP1-Q1', 'It\'s raining very heavily', true),
('EXP1-Q1-O2', 'EXP1-Q1', 'Cats and dogs are falling from the sky', false),
('EXP1-Q1-O3', 'EXP1-Q1', 'It\'s a light drizzle', false);

-- Add more complex grammar questions
INSERT INTO sections (section_id, exam_id, title, instruction_text, order_index) VALUES
('GRAM2-S1', 'GRAM2', 'Advanced Grammar', 'Complex grammatical structures', 1);

INSERT INTO questions (question_id, section_id, text_content, question_type, score_points) VALUES
('GRAM2-Q1', 'GRAM2-S1', 'Choose the correct conditional form: "If I _____ (know) about the meeting, I _____ (attend) it."', 'MULTIPLE_CHOICE', 1.0);

INSERT INTO options (option_id, question_id, option_text, is_correct) VALUES
('GRAM2-Q1-O1', 'GRAM2-Q1', 'had known / would have attended', true),
('GRAM2-Q1-O2', 'GRAM2-Q1', 'knew / would attend', false);

INSERT INTO options (option_id, question_id, option_text, is_correct)
SELECT CONCAT(question_id, '-O3'), question_id, 'know / will attend', false
FROM questions WHERE text_content LIKE '%If I _____ (know) about the meeting%';

-- Advanced Vocabulary Section
INSERT INTO sections (section_id, exam_id, title, instruction_text, order_index)
VALUES ('VOC1-S1', 'VOC1', 'Academic Vocabulary', 'Test your knowledge of advanced English vocabulary', 1);

INSERT INTO questions (question_id, section_id, text_content, question_type, score_points)
SELECT 'VOC1-Q1', 'VOC1-S1', 'Choose the synonym for "ubiquitous":', 'MULTIPLE_CHOICE', 1.0;

INSERT INTO options (option_id, question_id, option_text, is_correct) VALUES
('VOC1-Q1-O1', 'VOC1-Q1', 'omnipresent', true),
('VOC1-Q1-O2', 'VOC1-Q1', 'rare', false),
('VOC1-Q1-O3', 'VOC1-Q1', 'unique', false);
