-- Migration: Add thumbnail column to parts table
-- Run this if you have an existing database

ALTER TABLE parts ADD COLUMN thumbnail VARCHAR(255) AFTER size;
