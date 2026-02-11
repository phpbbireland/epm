-- Migration Script: Add Subcategories Support to Existing Database
-- Run this if you already have the database created

-- Step 1: Check if parent_id column exists, if not add it
SET @dbname = DATABASE();
SET @tablename = 'categories';
SET @columnname = 'parent_id';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' INT NULL AFTER name')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Step 2: Add foreign key if it doesn't exist
SET @fk_name = 'fk_parent_category';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (constraint_name = @fk_name)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD CONSTRAINT ', @fk_name, 
         ' FOREIGN KEY (parent_id) REFERENCES ', @tablename, '(id) ON DELETE CASCADE')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Step 3: Update unique constraint to allow same names under different parents
-- First drop the old unique constraint if it exists
ALTER TABLE categories DROP INDEX IF EXISTS name;

-- Add new unique constraint
ALTER TABLE categories ADD UNIQUE KEY unique_category_name (name, parent_id);

-- Step 4: Insert sample subcategories (only if they don't exist)
-- This uses INSERT IGNORE to skip if already exists

-- Get parent category IDs dynamically
SET @microcontrollers_id = (SELECT id FROM categories WHERE name = 'Microcontrollers' AND parent_id IS NULL LIMIT 1);
SET @sensors_id = (SELECT id FROM categories WHERE name = 'Sensors' AND parent_id IS NULL LIMIT 1);
SET @resistors_id = (SELECT id FROM categories WHERE name = 'Resistors' AND parent_id IS NULL LIMIT 1);
SET @capacitors_id = (SELECT id FROM categories WHERE name = 'Capacitors' AND parent_id IS NULL LIMIT 1);
SET @leds_id = (SELECT id FROM categories WHERE name = 'LEDs' AND parent_id IS NULL LIMIT 1);

-- Insert subcategories only if parent exists and subcategory doesn't exist
INSERT IGNORE INTO categories (name, parent_id, description)
SELECT 'Arduino', @microcontrollers_id, 'Arduino boards and compatible'
WHERE @microcontrollers_id IS NOT NULL;

INSERT IGNORE INTO categories (name, parent_id, description)
SELECT 'ESP32', @microcontrollers_id, 'ESP32 development boards'
WHERE @microcontrollers_id IS NOT NULL;

INSERT IGNORE INTO categories (name, parent_id, description)
SELECT 'STM32', @microcontrollers_id, 'STM32 microcontroller boards'
WHERE @microcontrollers_id IS NOT NULL;

INSERT IGNORE INTO categories (name, parent_id, description)
SELECT 'PIC', @microcontrollers_id, 'PIC microcontrollers'
WHERE @microcontrollers_id IS NOT NULL;

INSERT IGNORE INTO categories (name, parent_id, description)
SELECT 'Temperature Sensors', @sensors_id, 'Temperature and humidity sensors'
WHERE @sensors_id IS NOT NULL;

INSERT IGNORE INTO categories (name, parent_id, description)
SELECT 'Distance Sensors', @sensors_id, 'Ultrasonic and IR distance sensors'
WHERE @sensors_id IS NOT NULL;

INSERT IGNORE INTO categories (name, parent_id, description)
SELECT 'Motion Sensors', @sensors_id, 'PIR and accelerometer sensors'
WHERE @sensors_id IS NOT NULL;

INSERT IGNORE INTO categories (name, parent_id, description)
SELECT 'Gas Sensors', @sensors_id, 'Air quality and gas detection'
WHERE @sensors_id IS NOT NULL;

INSERT IGNORE INTO categories (name, parent_id, description)
SELECT 'Through-Hole Resistors', @resistors_id, 'Standard axial resistors'
WHERE @resistors_id IS NOT NULL;

INSERT IGNORE INTO categories (name, parent_id, description)
SELECT 'SMD Resistors', @resistors_id, 'Surface mount resistors'
WHERE @resistors_id IS NOT NULL;

INSERT IGNORE INTO categories (name, parent_id, description)
SELECT 'Variable Resistors', @resistors_id, 'Potentiometers and trimmers'
WHERE @resistors_id IS NOT NULL;

INSERT IGNORE INTO categories (name, parent_id, description)
SELECT 'Ceramic Capacitors', @capacitors_id, 'Ceramic disc and MLCC'
WHERE @capacitors_id IS NOT NULL;

INSERT IGNORE INTO categories (name, parent_id, description)
SELECT 'Electrolytic Capacitors', @capacitors_id, 'Aluminum electrolytic capacitors'
WHERE @capacitors_id IS NOT NULL;

INSERT IGNORE INTO categories (name, parent_id, description)
SELECT 'Film Capacitors', @capacitors_id, 'Polyester and polypropylene film'
WHERE @capacitors_id IS NOT NULL;

INSERT IGNORE INTO categories (name, parent_id, description)
SELECT 'Standard LEDs', @leds_id, '3mm and 5mm LEDs'
WHERE @leds_id IS NOT NULL;

INSERT IGNORE INTO categories (name, parent_id, description)
SELECT 'RGB LEDs', @leds_id, 'Multi-color LEDs'
WHERE @leds_id IS NOT NULL;

INSERT IGNORE INTO categories (name, parent_id, description)
SELECT 'LED Strips', @leds_id, 'Flexible LED strips and modules'
WHERE @leds_id IS NOT NULL;

-- Done!
SELECT 'Migration completed successfully!' as Status;
