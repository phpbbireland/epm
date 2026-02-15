**Only required for Version 1.0.0 **

# Database Migration Guide

## If You're Getting "Unknown column 'subcategory_id'" Error

This means you need to run the database migrations to add the subcategory feature.

## Migration Steps (IN ORDER):

### Step 1: Run the subcategories migration
This adds parent_id to categories table and creates sample subcategories.

**File:** `migration_add_subcategories.sql`

**How to run:**
```bash
# Option 1: MySQL command line
mysql -u root -p electronics_parts < migration_add_subcategories.sql

# Option 2: phpMyAdmin
1. Open phpMyAdmin
2. Select 'electronics_parts' database
3. Click 'Import' tab
4. Choose migration_add_subcategories.sql
5. Click 'Go'

# Option 3: Copy and paste
1. Open migration_add_subcategories.sql in text editor
2. Copy all contents
3. Paste into phpMyAdmin SQL tab
4. Click 'Go'
```

### Step 2: Run the parts subcategory migration
This adds subcategory_id column to parts table.

**File:** `migration_add_subcategory_to_parts.sql`

**How to run:**
```bash
# Option 1: MySQL command line
mysql -u root -p electronics_parts < migration_add_subcategory_to_parts.sql

# Option 2: phpMyAdmin
1. Open phpMyAdmin
2. Select 'electronics_parts' database
3. Click 'Import' tab
4. Choose migration_add_subcategory_to_parts.sql
5. Click 'Go'

# Option 3: Copy and paste
1. Open migration_add_subcategory_to_parts.sql in text editor
2. Copy all contents
3. Paste into phpMyAdmin SQL tab
4. Click 'Go'
```

## Verify Migrations

Run this SQL to check if migrations were successful:

```sql
-- Check if parent_id exists in categories
SHOW COLUMNS FROM categories LIKE 'parent_id';

-- Check if subcategory_id exists in parts
SHOW COLUMNS FROM parts LIKE 'subcategory_id';

-- View all categories (including subcategories)
SELECT 
    c.id,
    c.name,
    c.parent_id,
    p.name as parent_name
FROM categories c
LEFT JOIN categories p ON c.parent_id = p.id
ORDER BY COALESCE(c.parent_id, c.id), c.name;
```

## What If I Don't Want Subcategories?

The API now automatically detects if the subcategory_id column exists. If it doesn't exist, the app will work fine without subcategories - you just won't have that feature available.

However, it's recommended to run the migrations to get the full feature set.

## Troubleshooting

### Error: "Table 'electronics_parts.categories' doesn't exist"
**Solution:** Run the main database.sql first to create all tables.

### Error: "Duplicate key name 'unique_category_name'"
**Solution:** This is safe to ignore - it means the migration was already run.

### Error: "Foreign key constraint fails"
**Solution:** Make sure you run migration_add_subcategories.sql BEFORE migration_add_subcategory_to_parts.sql

### Part page still not working after migrations
**Solution:** 
1. Clear browser cache (Ctrl+F5)
2. Test API directly: `http://localhost/epm/api.php?action=single&id=1`
3. Check browser console for errors
4. Use test-api.html to diagnose

## All Migration Files (In Order)

1. **database.sql** - Initial database setup (run this first if starting fresh)
2. **migration_add_value_size.sql** - Adds value and size columns (optional)
3. **migration_add_thumbnail.sql** - Adds thumbnail support (optional)
4. **migration_add_version.sql** - Adds version tracking (optional)
5. **migration_add_subcategories.sql** - Adds parent_id to categories (required for subcategories)
6. **migration_add_subcategory_to_parts.sql** - Adds subcategory_id to parts (required for subcategories)

## Quick Setup (Fresh Install)

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE electronics_parts;"

# Run initial setup
mysql -u root -p electronics_parts < database.sql

# Add all features (optional but recommended)
mysql -u root -p electronics_parts < migration_add_value_size.sql
mysql -u root -p electronics_parts < migration_add_thumbnail.sql
mysql -u root -p electronics_parts < migration_add_version.sql
mysql -u root -p electronics_parts < migration_add_subcategories.sql
mysql -u root -p electronics_parts < migration_add_subcategory_to_parts.sql
```

## Need Help?

Check test-api.html to see exactly what error the API is returning.
