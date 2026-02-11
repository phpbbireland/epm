-- Create database
CREATE DATABASE IF NOT EXISTS electronics_parts;
USE electronics_parts;

-- Create config table for application settings
CREATE TABLE IF NOT EXISTS config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default configuration values
INSERT INTO config (config_key, config_value, description) VALUES
('version', '1.0.0', 'Application version number'),
('low_stock_threshold', '2', 'Quantity threshold for low stock warning'),
('theme', 'dark', 'UI theme: light or dark'),
('items_per_page', '50', 'Number of items to display per page'),
('enable_notifications', '1', 'Enable toast notifications (1=yes, 0=no)'),
('currency_symbol', '€', 'Currency symbol for pricing'),
('date_format', 'DD/MM/YYYY', 'Date format for display');

-- Create categories table with parent-child relationship
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    parent_id INT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE KEY unique_category_name (name, parent_id)
);

-- Create parts table
CREATE TABLE IF NOT EXISTS parts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_id INT NOT NULL,
    quantity INT DEFAULT 0,
    value VARCHAR(50),
    size VARCHAR(50),
    thumbnail VARCHAR(255),
    link VARCHAR(1000),
    project_folder_link VARCHAR(1000),
    code_folder_link VARCHAR(1000),
    freecad_folder_link VARCHAR(1000),
    youtube_link VARCHAR(1000),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

-- Insert sample categories (parent categories have parent_id = NULL)
INSERT INTO categories (name, parent_id, description) VALUES
('Microcontrollers', NULL, 'Microcontroller boards and chips'),
('Single Board Computers', NULL, 'Complete computers on a single board'),
('Sensors', NULL, 'Various types of sensors and detectors'),
('Motor Drivers', NULL, 'Motor control and driver ICs'),
('WiFi Modules', NULL, 'Wireless communication modules'),
('Resistors', NULL, 'Fixed and variable resistors'),
('Capacitors', NULL, 'Various capacitor types'),
('LEDs', NULL, 'Light emitting diodes'),
('Transistors', NULL, 'Bipolar and field effect transistors'),
('ICs', NULL, 'Integrated circuits')
ON DUPLICATE KEY UPDATE name=name;

-- Insert sample subcategories (only if they don't exist)
INSERT INTO categories (name, parent_id, description) VALUES
-- Microcontrollers subcategories
('Arduino', 1, 'Arduino boards and compatible'),
('ESP32', 1, 'ESP32 development boards'),
('STM32', 1, 'STM32 microcontroller boards'),
('PIC', 1, 'PIC microcontrollers'),
-- Sensors subcategories
('Temperature Sensors', 3, 'Temperature and humidity sensors'),
('Distance Sensors', 3, 'Ultrasonic and IR distance sensors'),
('Motion Sensors', 3, 'PIR and accelerometer sensors'),
('Gas Sensors', 3, 'Air quality and gas detection'),
-- Resistors subcategories
('Through-Hole Resistors', 6, 'Standard axial resistors'),
('SMD Resistors', 6, 'Surface mount resistors'),
('Variable Resistors', 6, 'Potentiometers and trimmers'),
-- Capacitors subcategories
('Ceramic Capacitors', 7, 'Ceramic disc and MLCC'),
('Electrolytic Capacitors', 7, 'Aluminum electrolytic capacitors'),
('Film Capacitors', 7, 'Polyester and polypropylene film'),
-- LEDs subcategories
('Standard LEDs', 8, '3mm and 5mm LEDs'),
('RGB LEDs', 8, 'Multi-color LEDs'),
('LED Strips', 8, 'Flexible LED strips and modules')
ON DUPLICATE KEY UPDATE description=VALUES(description);

-- Insert sample parts data
INSERT INTO parts (name, category_id, quantity, link, project_folder_link, code_folder_link, freecad_folder_link, youtube_link, description) VALUES
('Arduino Uno R3', 1, 5, 'https://store.arduino.cc/products/arduino-uno-rev3', '', '', '', '', 'Popular microcontroller board based on ATmega328P'),
('Raspberry Pi 4', 2, 3, 'https://www.raspberrypi.com/products/raspberry-pi-4-model-b/', '', '', '', '', '8GB RAM model with quad-core processor'),
('HC-SR04', 3, 10, 'https://www.sparkfun.com/products/15569', '', '', '', '', 'Ultrasonic distance sensor'),
('L293D', 4, 15, 'https://www.ti.com/product/L293D', '', '', '', '', 'Dual H-Bridge motor driver IC'),
('ESP8266', 5, 8, 'https://www.espressif.com/en/products/socs/esp8266', '', '', '', '', 'Low-cost WiFi microchip with TCP/IP stack');
