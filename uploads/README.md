# Uploads Directory

This directory stores uploaded thumbnail images for parts.

## Important Notes

1. **Permissions**: Ensure this directory is writable by the web server
   ```bash
   chmod 755 uploads/
   ```

2. **Apache**: If using Apache, ensure `.htaccess` allows image access

3. **File Types**: Supports JPG, PNG, GIF only

4. **File Size**: Maximum 250KB per image

5. **Dual Files**: System stores both original and 48x48 thumbnail
   - Original: `thumb_abc123.jpg` (actual size for hover preview)
   - Thumbnail: `thumb_thumb_abc123.jpg` (48x48 for table display)

6. **Security**: Only image files are accepted by upload.php

## Manual Setup

If the uploads directory doesn't exist or isn't writable:

```bash
mkdir uploads
chmod 755 uploads
chown www-data:www-data uploads  # On Linux
```

## Troubleshooting

If uploads fail:
- Check directory permissions
- Verify PHP upload_max_filesize setting
- Check disk space
- Review server error logs
