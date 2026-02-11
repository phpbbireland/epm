![Dashboard](https://github.com/phpbbireland/epm/blob/main/images/epm1.png)  

# Electronic Parts Manager (epm)

A complete web application for managing electronic parts inventory with CRUD operations (Create, Read, Update, Delete).  
Build with Claude AI and my 2 cents, works perfectly but might needs some UI tweaks.  

**Migration file only used in development, not required for install, use database.sql**  

## Features

- ✅ Add new electronic parts
- ✅ View all parts in a table
- ✅ Edit existing parts
- ✅ Delete parts
- ✅ Search/filter parts by name, category, or description
- ✅ Clean, responsive UI
- ✅ Real-time updates
- ✅ Toast notifications for user feedback

## Technologies Used

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Backend:** PHP 7.4+
- **Database:** MySQL 5.7+

## Database Schema

The application uses a single table `parts` with the following structure:

| Column | Type | Description |
|--------|------|-------------|
| id | INT (Primary Key, Auto Increment) | Unique identifier |
| name | VARCHAR(255) | Part name |
| category | VARCHAR(100) | Part category |
| link | VARCHAR(500) | Product/datasheet link |
| description | TEXT | Part description |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

## Installation Steps

### 1. Prerequisites

- PHP 7.4 or higher
- MySQL 5.7 or higher
- Apache/Nginx web server
- Web browser

### 2. Database Setup

1. Open phpMyAdmin or MySQL command line
2. Import the database schema:
   ```sql
   mysql -u root -p < database.sql
   ```
   Or manually run the SQL commands in `database.sql`

3. The database `epm` will be created with sample data

### 3. Configuration

1. Edit `config.php` and update database credentials:
   ```php
   define('DB_HOST', 'localhost');
   define('DB_USER', 'your_username');
   define('DB_PASS', 'your_password');
   define('DB_NAME', 'epm');
   ```

### 4. Web Server Setup

#### Using Apache (XAMPP/WAMP/LAMP)

1. Copy all files to your web server directory:
   - XAMPP: `C:\xampp\htdocs\epm\`
   - WAMP: `C:\wamp64\www\epm\`
   - LAMP: `/var/www/html/epm/`
   - XAMPP: `/opt/lampp/htdocs/epm/`

2. Start Apache and MySQL services

3. Access the application:
   ```
   epm
   ```

#### Using PHP Built-in Server (Development)

1. Navigate to the project directory:
   ```bash
   cd epm
   ```

2. Start the PHP server:
   ```bash
   php -S localhost:8000
   ```

3. Access the application:
   ```
   http://localhost:8000
   ```

## File Structure

```
epm (electronics_parts_manager)/
│
├── index.html          # Main HTML page
├── style.css           # Styling
├── script.js           # Frontend JavaScript
├── api.php             # Backend API for CRUD operations
├── config.php          # Database configuration
├── database.sql        # Database schema and sample data
└── README.md           # This file
```

## Usage Guide

### Adding a New Part

1. Fill in the form fields:
   - **Name:** (Required) Name of the electronic part
   - **Category:** (Required) Category/type of the parthttps://github.com/phpbbireland/epm/blob/main/images/epm1.png
   - **Link:** (Optional) URL to product page or datasheet
   - **Description:** (Optional) Additional details

2. Click "Add Part" button

### Editing a Part

1. Click the "Edit" button next to the part you want to modify
2. Form will populate with existing data
3. Make your changes
4. Click "Update Part" button
5. Click "Cancel" to abort editing

### Deleting a Part

1. Click the "Delete" button next to the part
2. Confirm the deletion in the popup dialog

### Searching Parts

1. Use the search box to filter parts
2. Search works on: Name, Category, and Description
3. Results update in real-time

## API Endpoints

### GET Requests

- `api.php?action=all` - Get all parts
- `api.php?action=single&id={id}` - Get single part by ID

### POST Requests

- `api.php?action=create` - Create new part
  ```json
  {
    "name": "Arduino Uno",
    "category": "Microcontrollers",
    "link": "https://example.com",
    "description": "ATmega328P board"
  }
  ```

### PUT Requests

- `api.php?action=update` - Update existing part
  ```json
  {
    "id": 1,
    "name": "Arduino Uno R3",
    "category": "Microcontrollers",
    "link": "https://example.com",
    "description": "Updated description"
  }
  ```

### DELETE Requests

- `api.php?action=delete&id={id}` - Delete part by ID

## Security Features

- ✅ SQL injection prevention using prepared statements
- ✅ XSS protection with HTML escaping
- ✅ Input validation on both client and server side
- ✅ HTTP method verification

## Browser Compatibility

- Chrome
- Firefox
- Safari
- Edge
- Opera

## Troubleshooting

### Database Connection Error

- Check database credentials in `config.php`
- Ensure MySQL service is running
- Verify database exists

### Parts Not Loading

- Check browser console for JavaScript errors
- Verify `api.php` is accessible
- Check file permissions

### Cannot Add/Edit/Delete

- Check database user permissions
- Verify API endpoint URLs
- Check browser network tab for errors

## Future Enhancements

- Image upload for parts
- Quantity tracking
- Multiple user accounts
- Export to CSV/PDF
- Advanced filtering options
- Barcode/QR code generation
- Parts location tracking

## License
AI geterated code may have restrictions, I don't know, I'm new to this?  
Free to use for personal projects.  

## Recommendations  
Use on local server only...  

## Author
Michael O'Toole (2026)  

*Created* with PHP, MySQL, JavaScript & Claude AI  

![Image2](https://github.com/phpbbireland/epm/blob/main/images/emp2.png)  

![Image3](https://github.com/phpbbireland/epm/blob/main/images/epm3.png)  

