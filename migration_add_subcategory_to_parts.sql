-- Migration: Add subcategory_id to parts table
-- This allows parts to be assigned to subcategories (child categories)
-- Run this AFTER running migration_add_subcategories.sql

-- Add subcategory_id column to parts table
ALTER TABLE parts 
ADD COLUMN IF NOT EXISTS subcategory_id INT NULL AFTER category_id;

-- Add foreign key constraint
ALTER TABLE parts 
ADD CONSTRAINT fk_parts_subcategory 
FOREIGN KEY (subcategory_id) 
REFERENCES categories(id) 
ON DELETE SET NULL;

-- Done!
SELECT 'subcategory_id column added successfully!' as Status;
