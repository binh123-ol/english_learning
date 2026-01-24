-- ============================================
-- English Learning Platform Database Schema
-- Combined Schema File
-- ============================================

-- Create Database
CREATE DATABASE IF NOT EXISTS english_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE english_db;

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    level_target VARCHAR(50),
    current_level VARCHAR(50),
    learning_streak INT NOT NULL DEFAULT 0,
    total_xp INT NOT NULL DEFAULT 0,
    assessment_completed BOOLEAN NOT NULL DEFAULT FALSE,
    last_activity_date DATETIME,
    created_at DATETIME,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. EXAMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS exams (
    exam_id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    exam_type VARCHAR(50) NOT NULL,
    level VARCHAR(50),
    duration_minutes INT NOT NULL,
    total_score INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. SECTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS sections (
    section_id VARCHAR(36) PRIMARY KEY,
    exam_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    instruction_text TEXT,
    order_index INT NOT NULL,
    FOREIGN KEY (exam_id) REFERENCES exams(exam_id) ON DELETE CASCADE,
    INDEX idx_exam_id (exam_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. QUESTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS questions (
    question_id VARCHAR(36) PRIMARY KEY,
    section_id VARCHAR(36) NOT NULL,
    question_type VARCHAR(50) NOT NULL,
    skill_type VARCHAR(50) NULL, -- Added from improve-exam-lesson-game.sql
    text_content TEXT NOT NULL,
    score_points DECIMAL(5,2) NOT NULL,
    correct_answer_text TEXT,
    FOREIGN KEY (section_id) REFERENCES sections(section_id) ON DELETE CASCADE,
    INDEX idx_section_id (section_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. OPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS options (
    option_id VARCHAR(36) PRIMARY KEY,
    question_id VARCHAR(36) NOT NULL,
    option_text VARCHAR(500) NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE,
    INDEX idx_question_id (question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. SESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS sessions (
    session_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    exam_id VARCHAR(36) NOT NULL,
    started_at DATETIME,
    finished_at DATETIME,
    total_correct INT DEFAULT 0,
    final_score DECIMAL(5,2) DEFAULT 0.00,
    band_score DECIMAL(3,1),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (exam_id) REFERENCES exams(exam_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_exam_id (exam_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. USER_ANSWERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_answers (
    answer_id VARCHAR(36) PRIMARY KEY,
    session_id VARCHAR(36) NOT NULL,
    question_id VARCHAR(36) NOT NULL,
    selected_option_id VARCHAR(36),
    text_response VARCHAR(500),
    is_correct BOOLEAN,
    score_earned DECIMAL(5,2) NOT NULL,
    answered_at DATETIME,
    FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE,
    FOREIGN KEY (selected_option_id) REFERENCES options(option_id) ON DELETE SET NULL,
    INDEX idx_session_id (session_id),
    INDEX idx_question_id (question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 8. LEVEL_ASSESSMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS level_assessments (
    assessment_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    listening_score DECIMAL(5,2),
    reading_score DECIMAL(5,2),
    writing_score DECIMAL(5,2),
    speaking_score DECIMAL(5,2),
    grammar_score DECIMAL(5,2),
    vocabulary_score DECIMAL(5,2),
    overall_level VARCHAR(50),
    overall_score DECIMAL(5,2),
    completed_at DATETIME,
    created_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 8.1. ASSESSMENT_QUESTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS assessment_questions (
    question_id VARCHAR(36) PRIMARY KEY,
    skill_type VARCHAR(50) NOT NULL,
    question_type VARCHAR(50) NOT NULL,
    text_content TEXT NOT NULL,
    audio_file_url VARCHAR(500) NULL, -- Added from add-audio-support.sql
    score_points DECIMAL(5,2) NOT NULL,
    correct_answer_text TEXT,
    difficulty_level VARCHAR(50),
    order_index INT,
    INDEX idx_skill_type (skill_type),
    INDEX idx_difficulty (difficulty_level),
    INDEX idx_audio_file_url (audio_file_url)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 8.2. ASSESSMENT_OPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS assessment_options (
    option_id VARCHAR(36) PRIMARY KEY,
    question_id VARCHAR(36) NOT NULL,
    option_text VARCHAR(500) NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    order_index INT,
    FOREIGN KEY (question_id) REFERENCES assessment_questions(question_id) ON DELETE CASCADE,
    INDEX idx_question_id (question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 8.3. ASSESSMENT_ANSWERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS assessment_answers (
    answer_id VARCHAR(36) PRIMARY KEY,
    assessment_id VARCHAR(36) NOT NULL,
    question_id VARCHAR(36) NOT NULL,
    selected_option_id VARCHAR(36),
    text_response TEXT,
    audio_file_url VARCHAR(500) NULL, -- Added from add-audio-support.sql
    is_correct BOOLEAN,
    score_earned DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    answered_at DATETIME,
    FOREIGN KEY (assessment_id) REFERENCES level_assessments(assessment_id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES assessment_questions(question_id) ON DELETE CASCADE,
    INDEX idx_assessment_id (assessment_id),
    INDEX idx_question_id (question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 9. LESSONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS lessons (
    lesson_id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    lesson_type VARCHAR(50) NOT NULL,
    level VARCHAR(50) NOT NULL,
    description TEXT,
    content TEXT,
    estimated_duration_minutes INT,
    xp_reward INT NOT NULL DEFAULT 10,
    difficulty_level VARCHAR(20) NOT NULL,
    order_index INT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    INDEX idx_level (level),
    INDEX idx_lesson_type (lesson_type),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 9.1. SUB_LESSONS TABLE (From improve-exam-lesson-game.sql)
-- ============================================
CREATE TABLE IF NOT EXISTS sub_lessons (
    sub_lesson_id VARCHAR(36) PRIMARY KEY,
    lesson_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    order_index INT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME,
    FOREIGN KEY (lesson_id) REFERENCES lessons(lesson_id) ON DELETE CASCADE,
    INDEX idx_lesson_id (lesson_id),
    INDEX idx_order_index (order_index)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 9.2. LESSON_MATERIALS TABLE (From improve-exam-lesson-game.sql)
-- ============================================
CREATE TABLE IF NOT EXISTS lesson_materials (
    material_id VARCHAR(36) PRIMARY KEY,
    sub_lesson_id VARCHAR(36) NOT NULL,
    material_type VARCHAR(50) NOT NULL, -- TEXT, VIDEO, AUDIO, PDF, IMAGE
    title VARCHAR(255) NOT NULL,
    content TEXT,
    file_url VARCHAR(500),
    order_index INT NOT NULL,
    created_at DATETIME,
    FOREIGN KEY (sub_lesson_id) REFERENCES sub_lessons(sub_lesson_id) ON DELETE CASCADE,
    INDEX idx_sub_lesson_id (sub_lesson_id),
    INDEX idx_material_type (material_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 9.3. LESSON_EXERCISES TABLE (From improve-exam-lesson-game.sql)
-- ============================================
CREATE TABLE IF NOT EXISTS lesson_exercises (
    exercise_id VARCHAR(36) PRIMARY KEY,
    sub_lesson_id VARCHAR(36) NOT NULL,
    exercise_type VARCHAR(50) NOT NULL, -- MULTIPLE_CHOICE, FILL_BLANK, TEXT_INPUT, MATCHING
    title VARCHAR(255) NOT NULL,
    question_text TEXT NOT NULL,
    correct_answer TEXT,
    score_points DECIMAL(5,2) NOT NULL DEFAULT 10.0,
    order_index INT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME,
    FOREIGN KEY (sub_lesson_id) REFERENCES sub_lessons(sub_lesson_id) ON DELETE CASCADE,
    INDEX idx_sub_lesson_id (sub_lesson_id),
    INDEX idx_exercise_type (exercise_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 9.4. EXERCISE_OPTIONS TABLE (From improve-exam-lesson-game.sql)
-- ============================================
CREATE TABLE IF NOT EXISTS exercise_options (
    option_id VARCHAR(36) PRIMARY KEY,
    exercise_id VARCHAR(36) NOT NULL,
    option_text VARCHAR(500) NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    order_index INT NOT NULL,
    FOREIGN KEY (exercise_id) REFERENCES lesson_exercises(exercise_id) ON DELETE CASCADE,
    INDEX idx_exercise_id (exercise_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 10. LEARNING_PATHS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS learning_paths (
    path_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    lesson_id VARCHAR(36) NOT NULL,
    status VARCHAR(20) NOT NULL,
    progress_percentage INT NOT NULL DEFAULT 0,
    started_at DATETIME,
    completed_at DATETIME,
    recommended_order INT,
    created_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(lesson_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 11. GAMES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS games (
    game_id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    game_type VARCHAR(50) NOT NULL,
    level VARCHAR(50) NOT NULL,
    description TEXT,
    xp_reward INT NOT NULL DEFAULT 5,
    difficulty_level VARCHAR(20) NOT NULL,
    estimated_duration_minutes INT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME,
    INDEX idx_level (level),
    INDEX idx_game_type (game_type),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 11.1. GAME CONTENT TABLES (From add-game-content-tables.sql)
-- ============================================

-- GAME_WORD_PAIRS TABLE
CREATE TABLE IF NOT EXISTS game_word_pairs (
    pair_id VARCHAR(36) PRIMARY KEY,
    game_id VARCHAR(36) NOT NULL,
    english_word VARCHAR(255) NOT NULL,
    vietnamese_translation VARCHAR(255) NOT NULL,
    display_order INT,
    created_at DATETIME,
    FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE,
    INDEX idx_game_id (game_id),
    INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- GAME_FLASHCARDS TABLE
CREATE TABLE IF NOT EXISTS game_flashcards (
    card_id VARCHAR(36) PRIMARY KEY,
    game_id VARCHAR(36) NOT NULL,
    front VARCHAR(500) NOT NULL,
    back VARCHAR(500) NOT NULL,
    example TEXT,
    display_order INT,
    created_at DATETIME,
    FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE,
    INDEX idx_game_id (game_id),
    INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- GAME_SPELLING_WORDS TABLE
CREATE TABLE IF NOT EXISTS game_spelling_words (
    word_id VARCHAR(36) PRIMARY KEY,
    game_id VARCHAR(36) NOT NULL,
    word VARCHAR(255) NOT NULL,
    hint VARCHAR(500),
    difficulty VARCHAR(50),
    created_at DATETIME,
    FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE,
    INDEX idx_game_id (game_id),
    INDEX idx_difficulty (difficulty)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- GAME_QUIZ_QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS game_quiz_questions (
    question_id VARCHAR(36) PRIMARY KEY,
    game_id VARCHAR(36) NOT NULL,
    question TEXT NOT NULL,
    option_a VARCHAR(500) NOT NULL,
    option_b VARCHAR(500) NOT NULL,
    option_c VARCHAR(500) NOT NULL,
    option_d VARCHAR(500) NOT NULL,
    correct_answer CHAR(1) NOT NULL,
    explanation TEXT,
    created_at DATETIME,
    FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE,
    INDEX idx_game_id (game_id),
    CHECK (correct_answer IN ('A', 'B', 'C', 'D'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- GAME_PUZZLES TABLE
CREATE TABLE IF NOT EXISTS game_puzzles (
    puzzle_id VARCHAR(36) PRIMARY KEY,
    game_id VARCHAR(36) NOT NULL,
    sentence TEXT NOT NULL,
    hint VARCHAR(500),
    puzzle_type VARCHAR(50),
    created_at DATETIME,
    FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE,
    INDEX idx_game_id (game_id),
    INDEX idx_puzzle_type (puzzle_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 11.2. MULTIPLAYER GAME TABLES (From improve-exam-lesson-game.sql)
-- ============================================

-- GAME_ROOMS TABLE
CREATE TABLE IF NOT EXISTS game_rooms (
    room_id VARCHAR(36) PRIMARY KEY,
    game_id VARCHAR(36) NOT NULL,
    room_name VARCHAR(255) NOT NULL,
    max_players INT NOT NULL DEFAULT 4,
    current_players INT NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'WAITING',
    game_config TEXT,
    started_at DATETIME,
    finished_at DATETIME,
    created_at DATETIME,
    FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE,
    INDEX idx_game_id (game_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ROOM_PLAYERS TABLE
CREATE TABLE IF NOT EXISTS room_players (
    room_player_id VARCHAR(36) PRIMARY KEY,
    room_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    score DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    completion_time_seconds INT,
    mistakes_count INT NOT NULL DEFAULT 0,
    rank_position INT,
    status VARCHAR(50) NOT NULL DEFAULT 'JOINED',
    joined_at DATETIME,
    finished_at DATETIME,
    FOREIGN KEY (room_id) REFERENCES game_rooms(room_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_room_id (room_id),
    INDEX idx_user_id (user_id),
    INDEX idx_rank_position (rank_position),
    UNIQUE KEY unique_room_user (room_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- GAME_ROUNDS TABLE
CREATE TABLE IF NOT EXISTS game_rounds (
    round_id VARCHAR(36) PRIMARY KEY,
    room_id VARCHAR(36) NOT NULL,
    round_number INT NOT NULL,
    round_data TEXT,
    started_at DATETIME,
    finished_at DATETIME,
    FOREIGN KEY (room_id) REFERENCES game_rooms(room_id) ON DELETE CASCADE,
    INDEX idx_room_id (room_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 12. GAME_SESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS game_sessions (
    game_session_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    game_id VARCHAR(36) NOT NULL,
    score DECIMAL(5,2),
    xp_earned INT NOT NULL DEFAULT 0,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    started_at DATETIME,
    completed_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_game_id (game_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 13. CONVERSATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS conversations (
    conversation_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    topic VARCHAR(255),
    difficulty_level VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    messages_count INT NOT NULL DEFAULT 0,
    xp_earned INT NOT NULL DEFAULT 0,
    started_at DATETIME,
    ended_at DATETIME,
    created_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 14. CONVERSATION_MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS conversation_messages (
    message_id VARCHAR(36) PRIMARY KEY,
    conversation_id VARCHAR(36) NOT NULL,
    sender_type VARCHAR(10) NOT NULL,
    content TEXT NOT NULL,
    pronunciation_score DECIMAL(3,2),
    grammar_errors TEXT,
    spelling_errors TEXT,
    feedback TEXT,
    sent_at DATETIME,
    FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id) ON DELETE CASCADE,
    INDEX idx_conversation_id (conversation_id),
    INDEX idx_sent_at (sent_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 15. USER_PROGRESS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_progress (
    progress_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    lesson_id VARCHAR(36),
    progress_type VARCHAR(50) NOT NULL,
    reference_id VARCHAR(36),
    progress_percentage INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL,
    xp_earned INT NOT NULL DEFAULT 0,
    last_accessed_at DATETIME,
    completed_at DATETIME,
    created_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(lesson_id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_progress_type (progress_type),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 16. LEARNING_STATISTICS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS learning_statistics (
    statistic_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    stat_date DATE NOT NULL,
    lessons_completed INT NOT NULL DEFAULT 0,
    games_completed INT NOT NULL DEFAULT 0,
    conversations_completed INT NOT NULL DEFAULT 0,
    total_time_minutes INT NOT NULL DEFAULT 0,
    xp_earned INT NOT NULL DEFAULT 0,
    streak_days INT NOT NULL DEFAULT 0,
    created_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_date (user_id, stat_date),
    INDEX idx_user_id (user_id),
    INDEX idx_stat_date (stat_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
