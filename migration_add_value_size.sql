-- Migration: Add value and size columns to parts table
-- Run this if you have an existing database

ALTER TABLE parts ADD COLUMN value VARCHAR(50) AFTER quantity;
ALTER TABLE parts ADD COLUMN size VARCHAR(50) AFTER value;
