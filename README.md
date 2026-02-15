![Dashboard](https://github.com/phpbbireland/epm/blob/main/images/epm1s.png)  

# Electronic Parts Manager (epm)

A complete web application for managing electronic parts inventory with CRUD operations (Create, Read, Update, Delete). Build with Claude AI and my 2 cents, works perfectly but might needs some tweaks. The project is in development and although fully functioning, the UI and some structures could be nicer.  

The intended use is not only to track components but perhaps more importantly for me, to track project source, materials and links.  
I have almost 1TB (lots of duplicates) of project and associated files relating to development going back to Adam... I need all the helps I can get to locate things ;)  

In an ideal world you might grab an older PC or a Pi, install Linux and XAMPP, install this app and see if it meets your needs, if not, you have all the code to make it better...  

**Please ignore all Migration and Update files (only added for references during development phase for version 1.0.0), already included in current database.sql**  

- ✅ **Part Detail View** - Dedicated page for viewing complete part information
- ✅ **Categories & Subcategories** - Hierarchical organization system
- ✅ **Advanced Search** - Real-time filtering by name, category, or description
- ✅ **Quantity Tracking** - Stock levels with color-coded badges
- ✅ **Thumbnail Images** - Upload and preview part photos with hover zoom
- ✅ **Multiple Links** - Datasheet, YouTube, project folders, code, FreeCAD
- ✅ **Value & Size Fields** - Track component specifications (e.g., 10kΩ, 0805)

### User Interface
- ✅ **Compact Pastel Theme** - Modern, easy-on-the-eyes design
- ✅ **Style Editor** - Customize colors with visual picker (Pickr library)
- ✅ **Dark Theme** - Complete dark mode support
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile
- ✅ **Toast Notifications** - Clickable feedback messages
- ✅ **Breadcrumb Navigation** - Easy navigation between pages
- ✅ **Settings Page** - Configure app behavior and preferences

### Advanced Features
- ✅ **Local File Links** - Support for file:// URLs with clipboard copy
- ✅ **Version Tracking** - Database versioning system
- ✅ **Stock Alerts** - Automatic low stock warnings on dashboard
- ✅ **Thumbnail Hover Preview** - Large preview on hover
- ✅ **API Testing Tool** - Built-in test-api.html for debugging
- ✅ **Migration System** - SQL scripts for database upgrades
- ✅ **Help Documentation** - Comprehensive guides included

## 🎨 Design Features

### Pastel Color Palette
- Soft gradients (#B8C5F2 → #D4A5E8)
- Easy-on-the-eyes color scheme
- Reduced visual fatigue
- Professional appearance

### Compact Layout
- Reduced padding and margins
- More content visible on screen
- Efficient use of space
- Smaller font sizes for density

### Visual Elements
- Color-coded stock badges (green/yellow/red)
- Emoji icons throughout interface
- Hover effects and transitions
- Rounded corners and soft shadows

## 🛠 Technologies Used

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Backend:** PHP 7.4+
- **Database:** MySQL 5.7+ / MariaDB
- **Libraries:** Pickr (color picker)
- **Icons:** Unicode emoji characters

## 📊 Database Schema

### Parts Table
| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK, Auto) | Unique identifier |
| name | VARCHAR(255) | Part name |
| category_id | INT | Foreign key to categories |
| subcategory_id | INT | Foreign key to subcategories |
| quantity | INT | Stock quantity |
| value | VARCHAR(50) | Component value (e.g., 10kΩ) |
| size | VARCHAR(50) | Component size (e.g., 0805) |
| link | VARCHAR(500) | Datasheet/product URL |
| youtube_link | VARCHAR(500) | Tutorial video URL |
| project_folder_link | VARCHAR(500) | Local project folder |
| code_folder_link | VARCHAR(500) | Local code folder |
| freecad_folder_link | VARCHAR(500) | Local CAD folder |
| description | TEXT | Part description |
| thumbnail | VARCHAR(255) | Thumbnail filename |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### Categories Table
| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK, Auto) | Unique identifier |
| name | VARCHAR(100) | Category name |
| parent_id | INT (NULL) | Parent category for subcategories |
| description | TEXT | Category description |
| created_at | TIMESTAMP | Creation timestamp |

## 📦 Installation Steps

### 1. Prerequisites

- PHP 7.4 or higher
- MySQL 5.7+ or MariaDB 10.3+
- Apache/Nginx web server (or PHP built-in server)
- Web browser (Chrome, Firefox, Safari, Edge)

### 2. Database Setup (XAMPP)

1. Browse to: 127.0.0.1
2. Select: phpMyAdmin from top Menu
3. Create the database named: *epm*
4. (option a) Select SQL (from top menu), add copy the contents of database.sql and paste...
5. (option b) Select Import (from top menu), Browse to database.sql and import...

### 2. Database Setup MySQ command line

1. Open MySQL command line
2. Import the database schema:
   ```sql
   mysql -u root -p < database.sql
   ```
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
   ```
    sudo /opt/lampp/manager-linux-x64.run
    (command/path dependant on your install type, this is mine)
    Manage Services tab -> Select: Start All
    Notes:
    As this PC may be connect to the outside world, I stop all services when not in use.
   ```

3. Access the application:
   ```
   Browse to: http://127.0.0.1/epm/index.html
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

## 📁 File Structure

```
electronics_parts_manager/
│
├── index.html                      # Dashboard
├── parts.html                      # Parts list
├── part.html                       # Single part detail view
├── add-part.html                   # Add new part
├── edit-part.html                  # Edit existing part
├── categories.html                 # Category management
├── subcategories.html              # Subcategory management
├── settings.html                   # App settings
├── styles.html                     # Style editor
├── help.html                       # Help documentation
├── test-api.html                   # API testing tool
│
├── style.css                       # Main stylesheet (pastel theme)
├── script.js                       # Shared JavaScript
├── dashboard.js                    # Dashboard functionality
├── parts.js                        # Parts list functionality
├── part.js                         # Single part view
├── add-part.js                     # Add part form
├── edit-part.js                    # Edit part form
├── categories.js                   # Categories management
├── subcategories.js                # Subcategories management
├── settings.js                     # Settings page
├── styles.js                       # Style editor (with Pickr)
├── config-loader.js                # Configuration loader
│
├── api.php                         # REST API backend
├── config.php                      # Database configuration
├── upload.php                      # Image upload handler
│
├── database.sql                    # Initial database schema
├── migration_add_value_size.sql    # Add value/size fields
├── migration_add_thumbnail.sql     # Add thumbnail support
├── migration_add_version.sql       # Add version tracking
├── migration_add_subcategories.sql # Add subcategory support
├── migration_add_subcategory_to_parts.sql # Link parts to subcategories
│
├── uploads/                        # Uploaded thumbnails directory
│   ├── .gitkeep
│   └── README.md
│
├── README.md                       # This file
├── MIGRATION_GUIDE.md              # Database upgrade guide
├── SUBCATEGORIES_GUIDE.md          # Subcategories documentation
└── VERSION_1.0.0_UPDATE.md         # Version 1.0 changelog
```

## 📖 Usage Guide

### Dashboard
- View statistics (total parts, categories, stock levels)
- See low stock alerts
- Quick action buttons for common tasks

### Managing Parts

#### Adding a Part
1. Click "Add New Part" or navigate to add-part.html
2. Fill in required fields (name, category)
3. Optional: Add quantity, value, size, description
4. Optional: Upload thumbnail image
5. Optional: Add links (datasheet, YouTube, folders)
6. Click "Add Part"

#### Viewing Part Details
1. Click part name in parts list
2. View all information on dedicated page
3. Use Edit or Delete buttons

#### Editing a Part
1. Click "Edit" button or edit from detail view
2. Modify fields
3. Click "Update Part"

#### Deleting a Part
1. Click "Delete" button
2. Confirm deletion
3. Part is permanently removed

### Managing Categories

#### Creating Categories
1. Go to Categories page
2. Click "Add Category"
3. Enter name and optional description
4. Click "Add Category"

#### Creating Subcategories
1. Select parent category
2. Click "View Subcategories"
3. Click "Add Subcategory"
4. Enter subcategory details

### Customizing Appearance

#### Using Style Editor
1. Navigate to Styles page (🎨 icon)
2. Click color preview boxes
3. Choose colors from palette or custom
4. See live preview
5. Click "Copy CSS" or "Download CSS"

#### Available Color Options
- Background, text, header colors
- Button colors (primary, hover, secondary)
- Card colors (background, border, accent)
- Link colors (normal, hover)

### Search and Filter
- Use search box on parts page
- Searches: name, category, description
- Results update in real-time

## 🔌 API Endpoints

### GET Requests
| Endpoint | Description | Example |
|----------|-------------|---------|
| `?action=all` | Get all parts | `api.php?action=all` |
| `?action=single&id={id}` | Get single part | `api.php?action=single&id=5` |
| `?action=categories` | Get all categories | `api.php?action=categories` |
| `?action=categories_tree` | Get category hierarchy | `api.php?action=categories_tree` |

### POST Requests
| Endpoint | Description | Parameters |
|----------|-------------|------------|
| `?action=create` | Create new part | name, category_id, quantity, etc. |
| `?action=update` | Update existing part | id, name, category_id, etc. |
| `?action=delete` | Delete part | id |

### Example: Create Part
```javascript
fetch('api.php?action=create', {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: 'name=Resistor&category_id=1&quantity=100&value=10k'
});
```

## 🔒 Security Features

- ✅ **SQL Injection Prevention** - Prepared statements
- ✅ **XSS Protection** - HTML escaping
- ✅ **Input Validation** - Client and server-side
- ✅ **HTTP Method Verification** - Proper REST methods
- ✅ **Output Buffering** - Clean JSON responses
- ✅ **Error Handling** - Graceful failure management

## 🌐 Browser Compatibility

| Browser | Supported | Notes |
|---------|-----------|-------|
| Chrome | ✅ Recommended | Best performance |
| Firefox | ✅ Full support | All features work |
| Safari | ✅ Full support | macOS/iOS |
| Edge | ✅ Full support | Chromium-based |
| Opera | ✅ Full support | Chromium-based |

## 🐛 Troubleshooting

### Database Connection Error
```
Error: Database connection failed
```
**Solution:**
- Check `config.php` credentials
- Ensure MySQL is running
- Verify database exists

### Parts Not Loading
```
Error loading parts / Blank page
```
**Solution:**
- Check browser console (F12)
- Test API: `api.php?action=all`
- Use `test-api.html` for debugging

### Unknown Column 'subcategory_id'
```
Fatal error: Unknown column 'p.subcategory_id'
```
**Solution:**
- Run migration: `migration_add_subcategory_to_parts.sql`
- See `MIGRATION_GUIDE.md`

### Thumbnail Upload Fails
```
Error uploading thumbnail
```
**Solution:**
- Check `uploads/` directory permissions (755)
- Verify PHP `upload_max_filesize` setting
- Check PHP `post_max_size` setting

### JSON Parse Error
```
JSON.parse: unexpected character
```
**Solution:**
- Whitespace/BOM in PHP files
- Already fixed: closing PHP tags removed
- Clear browser cache

## 🎯 Tips and Best Practices

### Organizing Parts
1. Create main categories first (Resistors, Capacitors, etc.)
2. Add subcategories for specifics (SMD Resistors, Ceramic Capacitors)
3. Use consistent naming conventions
4. Fill in value and size for components

### Using Links
- **Datasheet Link:** Direct URL to PDF or webpage
- **YouTube Link:** Tutorial or review video
- **Folder Links:** Use file:// for local folders (click to copy)
- Links open in new tab to preserve your place

### Stock Management
- Green badge: Good stock (>5)
- Yellow badge: Low stock (1-5)
- Red badge: Out of stock (0)
- Dashboard shows low stock alerts

### Thumbnails
- Recommended: 800x800px or smaller
- Formats: JPG, PNG, GIF, WebP
- Automatic thumbnail generation
- Hover for large preview

## 📚 Additional Documentation

- **MIGRATION_GUIDE.md** - Database upgrade instructions
- **SUBCATEGORIES_GUIDE.md** - Subcategory system guide
- **VERSION_1.0.0_UPDATE.md** - Version 1.0 changelog
- **help.html** - In-app help documentation

## 🚀 Future Enhancements

### Planned Features
- [ ] Barcode/QR code generation and scanning
- [ ] Parts location tracking (shelf, bin)
- [ ] Export to CSV/Excel/PDF
- [ ] Import from CSV
- [ ] Multi-user support with authentication
- [ ] Parts history/changelog
- [ ] Advanced filtering (by value, size, stock level)
- [ ] Shopping list generation
- [ ] Price tracking and alerts
- [ ] BOM (Bill of Materials) management

### Completed Features
- [x] Dashboard with statistics
- [x] Category and subcategory system
- [x] Thumbnail image support
- [x] Multiple link types
- [x] Value and size fields
- [x] Part detail view page
- [x] Style editor with color picker
- [x] Dark theme
- [x] Compact pastel design
- [x] Local file link support
- [x] Stock level tracking
- [x] API testing tool

## License
AI geterated code may have restrictions, I don't know, I'm new to this?  
Free to use for personal projects.  

## Recommendations  
Use on local server only...  

## Author
Michael O'Toole (2026)  

*Created* with PHP, MySQL, JavaScript & Claude AI  

We not only track componts, we can also track modules (projects)...  
![Image3](https://github.com/phpbbireland/epm/blob/main/images/parts-select800.png)  

