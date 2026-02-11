# Version 1.0.0 Update Instructions

## For Existing Installations

If you already have the Electronics Parts Manager installed and want to upgrade to version 1.0.0 with the new features, follow these steps:

### Step 1: Update Configuration Table

Your existing database doesn't have the `version` config entry. Run this SQL command:

**Option A: Using phpMyAdmin**
1. Open phpMyAdmin
2. Select your database
3. Click on "SQL" tab
4. Copy and paste the following SQL:

```sql
-- Add version number
INSERT IGNORE INTO config (config_key, config_value, description) 
VALUES ('version', '1.0.0', 'Application version number');
```

5. Click "Go"

**Option B: Update to New Defaults (Recommended)**

If you want to apply all the new default settings (Dark theme, Euro currency, etc.), run this instead:

```sql
-- Add version config
INSERT IGNORE INTO config (config_key, config_value, description) 
VALUES ('version', '1.0.0', 'Application version number');

-- Update to new defaults
UPDATE config SET config_value = 'dark' WHERE config_key = 'theme';
UPDATE config SET config_value = '€' WHERE config_key = 'currency_symbol';
UPDATE config SET config_value = 'DD/MM/YYYY' WHERE config_key = 'date_format';
UPDATE config SET config_value = '2' WHERE config_key = 'low_stock_threshold';
```

**Option C: Use Migration File**

Simply run the `migration_add_version.sql` file included in the package.

### Step 2: Replace Files

1. Backup your current files
2. Extract the new ZIP file
3. Replace all files EXCEPT:
   - `config.php` (keep your database settings)
   - `database.sql` (you already have your data)

### Step 3: Verify

1. Go to Settings page
2. Check that version "v1.0.0" appears in the top-right corner
3. Verify your settings show the new defaults (or your custom settings)

---

## For Fresh Installations

If this is a new installation:

1. Import `database.sql` - it already includes version 1.0.0
2. Configure `config.php` with your database credentials
3. Open the application
4. Version number will be displayed automatically

---

## What's New in Version 1.0.0

### Configuration Updates
✅ **Version Number** - Now tracked in config table
✅ **Default Theme** - Changed to Dark mode
✅ **Default Currency** - Changed to € (Euro)
✅ **Default Date Format** - Changed to DD/MM/YYYY (European)
✅ **Low Stock Threshold** - Changed to 2 (from 5)

### Features
✅ **Unlimited Subcategory Nesting** - Categories can have sub-subcategories infinitely
✅ **Move Parts** - Move parts between categories (button only shows when editing)
✅ **Toggle Subcategories View** - Show/hide subcategories on categories page
✅ **Hierarchical Category Tree** - Visual tree structure with indentation
✅ **Dark Theme by Default** - Professional dark navy/teal color scheme

### UI Improvements
✅ **Version Badge** - Displayed on settings page
✅ **Better Navigation** - Breadcrumbs for nested subcategories
✅ **Cleaner Tables** - Move button only in edit mode
✅ **Modal Dialogs** - For moving parts between categories

---

## Troubleshooting

### Version Not Showing

**Problem:** Settings page shows "v Loading..." instead of "v1.0.0"

**Solution:** 
1. Check that you ran the migration SQL
2. Verify the config table has a row with `config_key = 'version'`
3. Run this query to check:
   ```sql
   SELECT * FROM config WHERE config_key = 'version';
   ```
4. If no result, run the INSERT statement from Step 1 above

### Move Button Not Working

**Problem:** Can't see the Move button

**Solution:**
The move button ONLY appears when editing a part, not when viewing all parts.

**How to use it:**
1. Go to Parts page
2. Click "Edit" on any part
3. Form opens at the top
4. Move button appears: `[Update Part] [Move to Category] [Cancel]`
5. Click "Move to Category"
6. Select destination in modal
7. Click "Move Part"

**Note:** The move button is intentionally hidden when:
- Viewing the parts table
- Adding a new part
- Form is closed

### Categories Not Showing in Move Modal

**Problem:** Dropdown shows only "-- Select Category --"

**Solution:**
1. Check browser console (F12) for errors
2. Look for "Categories loaded: X categories" message
3. If you see "found 0 children", there may be a data issue
4. Verify categories exist in database
5. Check that categories have proper parent_id values

---

## Migration Checklist

- [ ] Backup current database
- [ ] Run migration SQL to add version
- [ ] Replace all files (keep config.php)
- [ ] Refresh browser (Ctrl+F5)
- [ ] Check version shows on Settings page
- [ ] Test Move Part feature (edit a part, click Move)
- [ ] Verify subcategories work (click View X button)
- [ ] Confirm dark theme is active (or change in Settings)

---

## Need Help?

If you encounter issues:
1. Check browser console for errors (F12)
2. Verify all SQL migrations ran successfully
3. Confirm all new files were copied
4. Clear browser cache (Ctrl+Shift+Delete)
5. Check that `config.php` database credentials are correct

---

**Version:** 1.0.0  
**Release Date:** 2024  
**Compatibility:** MySQL 5.7+, PHP 7.4+
