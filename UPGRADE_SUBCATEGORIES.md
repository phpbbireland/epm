# Upgrading to Subcategories Support for V 1.0.0 only

If you're seeing the error: **"Duplicate entry 'Temperature Sensors-3' for key 'unique_category_name'"**

This means you have an existing database that needs to be updated to support subcategories.

## Quick Fix (Recommended)

Run this SQL script in phpMyAdmin or MySQL command line:

```sql
USE electronics_parts;

-- Fix the unique constraint to allow same names under different parents
ALTER TABLE categories DROP INDEX IF EXISTS name;
ALTER TABLE categories DROP INDEX IF EXISTS unique_category_name;
ALTER TABLE categories ADD UNIQUE KEY unique_category_name (name, parent_id);
```

**That's it!** Your database is now ready for subcategories.

## Option 1: Quick Fix Script

1. Open phpMyAdmin and select your `electronics_parts` database
2. Click on "SQL" tab
3. Run the file: `fix_duplicate_categories.sql`
4. Click "Go"

## Option 2: Full Migration (For Existing Databases)

If you need to add the parent_id column and all subcategory features:

1. Open phpMyAdmin and select your `electronics_parts` database
2. Click on "SQL" tab
3. Run the file: `migration_add_subcategories.sql`
4. Click "Go"

This will:
- Add `parent_id` column if missing
- Add foreign key constraint
- Fix unique constraint
- Add sample subcategories

## Option 3: Fresh Install

If you're starting fresh or want to reset:

1. **Backup your data first!**
2. Drop the database: `DROP DATABASE electronics_parts;`
3. Run the main `database.sql` file
4. All done!

## Verifying the Fix

After applying the fix, you should be able to:

1. Go to Categories page
2. Click the "➕ Add New Category" button
3. Select a "Parent Category" from the dropdown
4. Create subcategories without errors

## What Changed?

**Before:** Categories had to have unique names globally
- ❌ Can't have "Temperature Sensors" twice, even under different parents

**After:** Categories can have the same name under different parents
- ✅ Can have "Standard" under both "LEDs" and "Resistors"
- ✅ Can have "Through-Hole" under multiple parent categories
- ✅ Each category is unique by (name + parent_id) combination

## Testing

Create a test subcategory:
1. Go to Categories page
2. Add a new category with:
   - Name: "Arduino"
   - Parent: "Microcontrollers"
3. It should work without errors!

## Need Help?

The unique constraint error happens because the old database structure didn't support the hierarchy. The fix is simple and safe - it just changes how we identify unique categories.

After the fix:
- All your existing categories remain unchanged
- You can now organize them into parent/child relationships
- You can create subcategories through the UI
