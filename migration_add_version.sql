-- Migration: Add version number to config table
-- Run this if you already have an existing database

-- Add version config if it doesn't exist
INSERT IGNORE INTO config (config_key, config_value, description) 
VALUES ('version', '1.0.0', 'Application version number');

-- Update other config values to new defaults (optional - only if you want to reset to new defaults)
UPDATE config SET config_value = 'dark' WHERE config_key = 'theme';
UPDATE config SET config_value = '€' WHERE config_key = 'currency_symbol';
UPDATE config SET config_value = 'DD/MM/YYYY' WHERE config_key = 'date_format';
UPDATE config SET config_value = '2' WHERE config_key = 'low_stock_threshold';
