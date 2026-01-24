-- Migration: Add exams_completed column to learning_statistics table
-- Date: 2025-12-26
-- Description: Add support for tracking completed exams in daily statistics

USE english_db;

-- Add exams_completed column to learning_statistics table
ALTER TABLE learning_statistics 
ADD COLUMN exams_completed INT NOT NULL DEFAULT 0 AFTER conversations_completed;

-- Update comment
ALTER TABLE learning_statistics 
COMMENT = 'Daily learning statistics including lessons, games, conversations, and exams';
