-- Quick Fix: Resolve duplicate category names issue
-- This allows categories with the same name under different parents

USE electronics_parts;

-- Drop the old unique constraint that doesn't allow duplicate names
ALTER TABLE categories DROP INDEX IF EXISTS name;
ALTER TABLE categories DROP INDEX IF EXISTS unique_category_name;

-- Add new unique constraint that allows same name under different parents
ALTER TABLE categories ADD UNIQUE KEY unique_category_name (name, parent_id);

-- Show current categories
SELECT 
    c.id,
    c.name,
    COALESCE(p.name, 'None (Top Level)') as parent_category,
    c.description
FROM categories c
LEFT JOIN categories p ON c.parent_id = p.id
ORDER BY COALESCE(c.parent_id, c.id), c.name;

SELECT 'Fix applied successfully! You can now have categories with the same name under different parents.' as Status;
