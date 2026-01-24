-- ============================================
-- English Learning Platform Data Injection
-- Combined Data File
-- ============================================

USE english_db;

-- Clear existing data
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
DELETE FROM assessment_options;
DELETE FROM assessment_questions;

-- ============================================
-- 1. INSERT LESSONS
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
-- 2. INSERT GAMES
-- ============================================
INSERT INTO games (game_id, title, game_type, level, description, xp_reward, difficulty_level, estimated_duration_minutes, is_active, created_at) VALUES
('GAME-001', 'Word Match', 'WORD_MATCH', 'BEGINNER', 'Match words with their meanings', 5, 'EASY', 5, TRUE, NOW()),
('GAME-002', 'Grammar Quiz', 'QUIZ', 'ELEMENTARY', 'Test your grammar knowledge', 10, 'MEDIUM', 10, TRUE, NOW()),
('GAME-003', 'Flashcard Challenge', 'FLASHCARD', 'INTERMEDIATE', 'Learn vocabulary with flashcards', 8, 'MEDIUM', 8, TRUE, NOW()),
('GAME-004', 'Spelling Bee', 'SPELLING', 'ELEMENTARY', 'Test your spelling skills', 7, 'MEDIUM', 7, TRUE, NOW()),
('GAME-005', 'Sentence Puzzle', 'PUZZLE', 'INTERMEDIATE', 'Rearrange words to form sentences', 12, 'HARD', 12, TRUE, NOW()),
('GAME-006', 'Vocabulary Builder', 'WORD_MATCH', 'ADVANCED', 'Advanced vocabulary matching game', 15, 'HARD', 15, TRUE, NOW());

-- ============================================
-- 3. INSERT EXAMS
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

-- ============================================
-- 4. INSERT ASSESSMENT QUESTIONS (Level Assessments)
-- ============================================

-- LISTENING Questions (5 questions)
INSERT INTO assessment_questions (question_id, skill_type, question_type, text_content, score_points, correct_answer_text, difficulty_level, order_index) VALUES
('aq-l-001', 'LISTENING', 'MULTIPLE_CHOICE', 'Listen to the conversation. What time does the meeting start?', 20.00, NULL, 'BEGINNER', 1),
('aq-l-002', 'LISTENING', 'MULTIPLE_CHOICE', 'Where does the conversation take place?', 20.00, NULL, 'ELEMENTARY', 2),
('aq-l-003', 'LISTENING', 'MULTIPLE_CHOICE', 'What is the main topic of the discussion?', 20.00, NULL, 'INTERMEDIATE', 3),
('aq-l-004', 'LISTENING', 'MULTIPLE_CHOICE', 'What does the speaker recommend?', 20.00, NULL, 'UPPER_INTERMEDIATE', 4),
('aq-l-005', 'LISTENING', 'MULTIPLE_CHOICE', 'What is the speaker''s attitude towards the proposal?', 20.00, NULL, 'ADVANCED', 5);

-- LISTENING Options
INSERT INTO assessment_options (option_id, question_id, option_text, is_correct, order_index) VALUES
('ao-l-001-a', 'aq-l-001', '9:00 AM', TRUE, 1),
('ao-l-001-b', 'aq-l-001', '10:00 AM', FALSE, 2),
('ao-l-001-c', 'aq-l-001', '11:00 AM', FALSE, 3),
('ao-l-001-d', 'aq-l-001', '2:00 PM', FALSE, 4),
('ao-l-002-a', 'aq-l-002', 'At a restaurant', FALSE, 1),
('ao-l-002-b', 'aq-l-002', 'In an office', TRUE, 2),
('ao-l-002-c', 'aq-l-002', 'At a library', FALSE, 3),
('ao-l-002-d', 'aq-l-002', 'In a park', FALSE, 4),
('ao-l-003-a', 'aq-l-003', 'Weather forecast', FALSE, 1),
('ao-l-003-b', 'aq-l-003', 'Project planning', TRUE, 2),
('ao-l-003-c', 'aq-l-003', 'Travel arrangements', FALSE, 3),
('ao-l-003-d', 'aq-l-003', 'Food preferences', FALSE, 4),
('ao-l-004-a', 'aq-l-004', 'To postpone the decision', FALSE, 1),
('ao-l-004-b', 'aq-l-004', 'To proceed with the plan', TRUE, 2),
('ao-l-004-c', 'aq-l-004', 'To cancel the project', FALSE, 3),
('ao-l-004-d', 'aq-l-004', 'To wait for more information', FALSE, 4),
('ao-l-005-a', 'aq-l-005', 'Enthusiastic', TRUE, 1),
('ao-l-005-b', 'aq-l-005', 'Skeptical', FALSE, 2),
('ao-l-005-c', 'aq-l-005', 'Indifferent', FALSE, 3),
('ao-l-005-d', 'aq-l-005', 'Opposed', FALSE, 4);

-- READING Questions (5 questions)
INSERT INTO assessment_questions (question_id, skill_type, question_type, text_content, score_points, correct_answer_text, difficulty_level, order_index) VALUES
('aq-r-001', 'READING', 'MULTIPLE_CHOICE', 'Read the passage: "Education is the foundation of personal and professional growth. It opens doors to opportunities and helps individuals achieve their goals." What is the main idea?', 20.00, NULL, 'BEGINNER', 1),
('aq-r-002', 'READING', 'MULTIPLE_CHOICE', 'In the sentence "The significant impact of technology cannot be overstated," what does "significant" mean?', 20.00, NULL, 'ELEMENTARY', 2),
('aq-r-003', 'READING', 'MULTIPLE_CHOICE', 'Based on the passage, what can be inferred about the author''s opinion on remote work?', 20.00, NULL, 'INTERMEDIATE', 3),
('aq-r-004', 'READING', 'MULTIPLE_CHOICE', 'What is the author''s primary purpose in writing this article about climate change?', 20.00, NULL, 'UPPER_INTERMEDIATE', 4),
('aq-r-005', 'READING', 'MULTIPLE_CHOICE', 'What is the tone of this passage: "The relentless march of progress, while admirable, has come at an immeasurable cost to our planet."?', 20.00, NULL, 'ADVANCED', 5);

-- READING Options
INSERT INTO assessment_options (option_id, question_id, option_text, is_correct, order_index) VALUES
('ao-r-001-a', 'aq-r-001', 'Education is important for success', TRUE, 1),
('ao-r-001-b', 'aq-r-001', 'Education is expensive', FALSE, 2),
('ao-r-001-c', 'aq-r-001', 'Education is optional', FALSE, 3),
('ao-r-001-d', 'aq-r-001', 'Education is difficult', FALSE, 4),
('ao-r-002-a', 'aq-r-002', 'Important', TRUE, 1),
('ao-r-002-b', 'aq-r-002', 'Small', FALSE, 2),
('ao-r-002-c', 'aq-r-002', 'Unusual', FALSE, 3),
('ao-r-002-d', 'aq-r-002', 'Common', FALSE, 4),
('ao-r-003-a', 'aq-r-003', 'The author supports remote work', TRUE, 1),
('ao-r-003-b', 'aq-r-003', 'The author opposes remote work', FALSE, 2),
('ao-r-003-c', 'aq-r-003', 'The author is neutral', FALSE, 3),
('ao-r-003-d', 'aq-r-003', 'The author is uncertain', FALSE, 4),
('ao-r-004-a', 'aq-r-004', 'To inform about the causes', FALSE, 1),
('ao-r-004-b', 'aq-r-004', 'To persuade action', TRUE, 2),
('ao-r-004-c', 'aq-r-004', 'To entertain readers', FALSE, 3),
('ao-r-004-d', 'aq-r-004', 'To criticize policies', FALSE, 4),
('ao-r-005-a', 'aq-r-005', 'Optimistic', FALSE, 1),
('ao-r-005-b', 'aq-r-005', 'Concerned', TRUE, 2),
('ao-r-005-c', 'aq-r-005', 'Humorous', FALSE, 3),
('ao-r-005-d', 'aq-r-005', 'Sarcastic', FALSE, 4);

-- WRITING Questions (5 questions)
INSERT INTO assessment_questions (question_id, skill_type, question_type, text_content, score_points, correct_answer_text, difficulty_level, order_index) VALUES
('aq-w-001', 'WRITING', 'TEXT_INPUT', 'Complete the sentence: "I _____ to the store yesterday." (past tense of "go")', 20.00, 'went', 'BEGINNER', 1),
('aq-w-002', 'WRITING', 'TEXT_INPUT', 'Write the past tense of "buy".', 20.00, 'bought', 'ELEMENTARY', 2),
('aq-w-003', 'WRITING', 'TEXT_INPUT', 'Complete: "If I _____ rich, I would travel the world." (use correct form of "be")', 20.00, 'were', 'INTERMEDIATE', 3),
('aq-w-004', 'WRITING', 'TEXT_INPUT', 'Write a synonym for "beautiful" (one word).', 20.00, 'gorgeous', 'UPPER_INTERMEDIATE', 4),
('aq-w-005', 'WRITING', 'TEXT_INPUT', 'Complete: "Not only _____ he arrive late, but he also forgot the documents." (use correct auxiliary verb)', 20.00, 'did', 'ADVANCED', 5);

-- SPEAKING Questions (5 questions)
INSERT INTO assessment_questions (question_id, skill_type, question_type, text_content, score_points, correct_answer_text, difficulty_level, order_index) VALUES
('aq-s-001', 'SPEAKING', 'TEXT_INPUT', 'How do you pronounce "schedule"? Write it phonetically (e.g., "sked-yool" or "shed-yool").', 20.00, 'shed-yool', 'BEGINNER', 1),
('aq-s-002', 'SPEAKING', 'TEXT_INPUT', 'What is the correct stress pattern for "photograph"? (Write with capital letters for stressed syllables, e.g., "PHO-to-graph")', 20.00, 'PHO-to-graph', 'ELEMENTARY', 2),
('aq-s-003', 'SPEAKING', 'TEXT_INPUT', 'How would you express disagreement politely? (Write a phrase)', 20.00, 'I see your point, but', 'INTERMEDIATE', 3),
('aq-s-004', 'SPEAKING', 'TEXT_INPUT', 'What is an appropriate formal response to "How do you do?"?', 20.00, 'How do you do?', 'UPPER_INTERMEDIATE', 4),
('aq-s-005', 'SPEAKING', 'TEXT_INPUT', 'How would you introduce a nuanced opinion? (Write a phrase)', 20.00, 'On the one hand', 'ADVANCED', 5);

-- GRAMMAR Questions (5 questions)
INSERT INTO assessment_questions (question_id, skill_type, question_type, text_content, score_points, correct_answer_text, difficulty_level, order_index) VALUES
('aq-g-001', 'GRAMMAR', 'MULTIPLE_CHOICE', 'Choose the correct form: "She _____ to school every day."', 20.00, NULL, 'BEGINNER', 1),
('aq-g-002', 'GRAMMAR', 'MULTIPLE_CHOICE', 'Choose the correct form: "I have _____ this book before."', 20.00, NULL, 'ELEMENTARY', 2),
('aq-g-003', 'GRAMMAR', 'MULTIPLE_CHOICE', 'Choose the correct form: "If I _____ you, I would study harder."', 20.00, NULL, 'INTERMEDIATE', 3),
('aq-g-004', 'GRAMMAR', 'MULTIPLE_CHOICE', 'Choose the correct form: "The report _____ by the team yesterday."', 20.00, NULL, 'UPPER_INTERMEDIATE', 4),
('aq-g-005', 'GRAMMAR', 'MULTIPLE_CHOICE', 'Choose the correct form: "Not only _____ he arrive late, but he also forgot the documents."', 20.00, NULL, 'ADVANCED', 5);

-- GRAMMAR Options
INSERT INTO assessment_options (option_id, question_id, option_text, is_correct, order_index) VALUES
('ao-g-001-a', 'aq-g-001', 'go', FALSE, 1),
('ao-g-001-b', 'aq-g-001', 'goes', TRUE, 2),
('ao-g-001-c', 'aq-g-001', 'going', FALSE, 3),
('ao-g-001-d', 'aq-g-001', 'went', FALSE, 4),
('ao-g-002-a', 'aq-g-002', 'read', TRUE, 1),
('ao-g-002-b', 'aq-g-002', 'reading', FALSE, 2),
('ao-g-002-c', 'aq-g-002', 'reads', FALSE, 3),
('ao-g-002-d', 'aq-g-002', 'readed', FALSE, 4),
('ao-g-003-a', 'aq-g-003', 'am', FALSE, 1),
('ao-g-003-b', 'aq-g-003', 'was', FALSE, 2),
('ao-g-003-c', 'aq-g-003', 'were', TRUE, 3),
('ao-g-003-d', 'aq-g-003', 'be', FALSE, 4),
('ao-g-004-a', 'aq-g-004', 'is completed', FALSE, 1),
('ao-g-004-b', 'aq-g-004', 'was completed', TRUE, 2),
('ao-g-004-c', 'aq-g-004', 'has completed', FALSE, 3),
('ao-g-004-d', 'aq-g-004', 'will completed', FALSE, 4),
('ao-g-005-a', 'aq-g-005', 'does', FALSE, 1),
('ao-g-005-b', 'aq-g-005', 'did', TRUE, 2),
('ao-g-005-c', 'aq-g-005', 'do', FALSE, 3),
('ao-g-005-d', 'aq-g-005', 'will', FALSE, 4);

-- VOCABULARY Questions (5 questions)
INSERT INTO assessment_questions (question_id, skill_type, question_type, text_content, score_points, correct_answer_text, difficulty_level, order_index) VALUES
('aq-v-001', 'VOCABULARY', 'MULTIPLE_CHOICE', 'What is the meaning of "happy"?', 20.00, NULL, 'BEGINNER', 1),
('aq-v-002', 'VOCABULARY', 'MULTIPLE_CHOICE', 'What is a synonym for "big"?', 20.00, NULL, 'ELEMENTARY', 2),
('aq-v-003', 'VOCABULARY', 'MULTIPLE_CHOICE', 'What does "procrastinate" mean?', 20.00, NULL, 'INTERMEDIATE', 3),
('aq-v-004', 'VOCABULARY', 'MULTIPLE_CHOICE', 'What is the antonym of "generous"?', 20.00, NULL, 'UPPER_INTERMEDIATE', 4),
('aq-v-005', 'VOCABULARY', 'MULTIPLE_CHOICE', 'What does "ubiquitous" mean?', 20.00, NULL, 'ADVANCED', 5);

-- VOCABULARY Options
INSERT INTO assessment_options (option_id, question_id, option_text, is_correct, order_index) VALUES
('ao-v-001-a', 'aq-v-001', 'Sad', FALSE, 1),
('ao-v-001-b', 'aq-v-001', 'Joyful', TRUE, 2),
('ao-v-001-c', 'aq-v-001', 'Angry', FALSE, 3),
('ao-v-001-d', 'aq-v-001', 'Tired', FALSE, 4),
('ao-v-002-a', 'aq-v-002', 'Small', FALSE, 1),
('ao-v-002-b', 'aq-v-002', 'Large', TRUE, 2),
('ao-v-002-c', 'aq-v-002', 'Medium', FALSE, 3),
('ao-v-002-d', 'aq-v-002', 'Tiny', FALSE, 4),
('ao-v-003-a', 'aq-v-003', 'To do immediately', FALSE, 1),
('ao-v-003-b', 'aq-v-003', 'To delay', TRUE, 2),
('ao-v-003-c', 'aq-v-003', 'To hurry', FALSE, 3),
('ao-v-003-d', 'aq-v-003', 'To finish', FALSE, 4),
('ao-v-004-a', 'aq-v-004', 'Kind', FALSE, 1),
('ao-v-004-b', 'aq-v-004', 'Selfish', TRUE, 2),
('ao-v-004-c', 'aq-v-004', 'Friendly', FALSE, 3),
('ao-v-004-d', 'aq-v-004', 'Helpful', FALSE, 4),
('ao-v-005-a', 'aq-v-005', 'Rare', FALSE, 1),
('ao-v-005-b', 'aq-v-005', 'Everywhere', TRUE, 2),
('ao-v-005-c', 'aq-v-005', 'Nowhere', FALSE, 3),
('ao-v-005-d', 'aq-v-005', 'Somewhere', FALSE, 4);

-- Additional LISTENING Questions
INSERT INTO assessment_questions (question_id, skill_type, question_type, text_content, score_points, correct_answer_text, difficulty_level, order_index) VALUES
('aq-l-006', 'LISTENING', 'MULTIPLE_CHOICE', 'What is the speaker trying to explain?', 20.00, NULL, 'INTERMEDIATE', 6),
('aq-l-007', 'LISTENING', 'MULTIPLE_CHOICE', 'How does the speaker feel about the situation?', 20.00, NULL, 'UPPER_INTERMEDIATE', 7);

INSERT INTO assessment_options (option_id, question_id, option_text, is_correct, order_index) VALUES
('ao-l-006-a', 'aq-l-006', 'A new procedure', TRUE, 1),
('ao-l-006-b', 'aq-l-006', 'A problem', FALSE, 2),
('ao-l-006-c', 'aq-l-006', 'A schedule', FALSE, 3),
('ao-l-006-d', 'aq-l-006', 'A location', FALSE, 4),
('ao-l-007-a', 'aq-l-007', 'Confident', TRUE, 1),
('ao-l-007-b', 'aq-l-007', 'Worried', FALSE, 2),
('ao-l-007-c', 'aq-l-007', 'Confused', FALSE, 3),
('ao-l-007-d', 'aq-l-007', 'Indifferent', FALSE, 4);

-- Additional READING Questions
INSERT INTO assessment_questions (question_id, skill_type, question_type, text_content, score_points, correct_answer_text, difficulty_level, order_index) VALUES
('aq-r-006', 'READING', 'MULTIPLE_CHOICE', 'What is the best title for this passage?', 20.00, NULL, 'INTERMEDIATE', 6),
('aq-r-007', 'READING', 'MULTIPLE_CHOICE', 'What does the word "elaborate" mean in this context?', 20.00, NULL, 'UPPER_INTERMEDIATE', 7);

INSERT INTO assessment_options (option_id, question_id, option_text, is_correct, order_index) VALUES
('ao-r-006-a', 'aq-r-006', 'The Benefits of Exercise', TRUE, 1),
('ao-r-006-b', 'aq-r-006', 'How to Cook', FALSE, 2),
('ao-r-006-c', 'aq-r-006', 'Travel Guide', FALSE, 3),
('ao-r-006-d', 'aq-r-006', 'History Lesson', FALSE, 4),
('ao-r-007-a', 'aq-r-007', 'Simple', FALSE, 1),
('ao-r-007-b', 'aq-r-007', 'Detailed', TRUE, 2),
('ao-r-007-c', 'aq-r-007', 'Quick', FALSE, 3),
('ao-r-007-d', 'aq-r-007', 'Basic', FALSE, 4);

-- Additional WRITING Questions
INSERT INTO assessment_questions (question_id, skill_type, question_type, text_content, score_points, correct_answer_text, difficulty_level, order_index) VALUES
('aq-w-006', 'WRITING', 'TEXT_INPUT', 'Complete: "She _____ studying English for three years." (use present perfect continuous)', 20.00, 'has been', 'INTERMEDIATE', 6),
('aq-w-007', 'WRITING', 'TEXT_INPUT', 'Write the comparative form of "good".', 20.00, 'better', 'ELEMENTARY', 7);

-- Additional GRAMMAR Questions
INSERT INTO assessment_questions (question_id, skill_type, question_type, text_content, score_points, correct_answer_text, difficulty_level, order_index) VALUES
('aq-g-006', 'GRAMMAR', 'MULTIPLE_CHOICE', 'Choose the correct form: "By next year, I _____ here for five years."', 20.00, NULL, 'UPPER_INTERMEDIATE', 6),
('aq-g-007', 'GRAMMAR', 'MULTIPLE_CHOICE', 'Choose the correct form: "I wish I _____ more time."', 20.00, NULL, 'INTERMEDIATE', 7);

INSERT INTO assessment_options (option_id, question_id, option_text, is_correct, order_index) VALUES
('ao-g-006-a', 'aq-g-006', 'will work', FALSE, 1),
('ao-g-006-b', 'aq-g-006', 'will have worked', TRUE, 2),
('ao-g-006-c', 'aq-g-006', 'work', FALSE, 3),
('ao-g-006-d', 'aq-g-006', 'worked', FALSE, 4),
('ao-g-007-a', 'aq-g-007', 'have', FALSE, 1),
('ao-g-007-b', 'aq-g-007', 'had', TRUE, 2),
('ao-g-007-c', 'aq-g-007', 'will have', FALSE, 3),
('ao-g-007-d', 'aq-g-007', 'have had', FALSE, 4);

-- Additional VOCABULARY Questions
INSERT INTO assessment_questions (question_id, skill_type, question_type, text_content, score_points, correct_answer_text, difficulty_level, order_index) VALUES
('aq-v-006', 'VOCABULARY', 'MULTIPLE_CHOICE', 'What does "ambiguous" mean?', 20.00, NULL, 'UPPER_INTERMEDIATE', 6),
('aq-v-007', 'VOCABULARY', 'MULTIPLE_CHOICE', 'What is a synonym for "excellent"?', 20.00, NULL, 'INTERMEDIATE', 7);

INSERT INTO assessment_options (option_id, question_id, option_text, is_correct, order_index) VALUES
('ao-v-006-a', 'aq-v-006', 'Clear', FALSE, 1),
('ao-v-006-b', 'aq-v-006', 'Unclear', TRUE, 2),
('ao-v-006-c', 'aq-v-006', 'Obvious', FALSE, 3),
('ao-v-006-d', 'aq-v-006', 'Certain', FALSE, 4),
('ao-v-007-a', 'aq-v-007', 'Poor', FALSE, 1),
('ao-v-007-b', 'aq-v-007', 'Outstanding', TRUE, 2),
('ao-v-007-c', 'aq-v-007', 'Average', FALSE, 3),
('ao-v-007-d', 'aq-v-007', 'Bad', FALSE, 4);

COMMIT;
