// URL Utilities for handling web URLs and local file paths

/**
 * Validate if a string is a valid URL (web or file://)
 */
function isValidUrl(string) {
    if (!string || string.trim() === '') {
        return true; // Empty is valid (optional field)
    }
    
    // Check for file:// protocol (local paths)
    if (string.startsWith('file://')) {
        return true;
    }
    
    // Check for standard web protocols
    try {
        const url = new URL(string);
        return ['http:', 'https:', 'ftp:'].includes(url.protocol);
    } catch (e) {
        return false;
    }
}

/**
 * Format a local path to file:// URL
 * Handles both Windows and Unix paths
 */
function formatLocalPath(path) {
    if (!path || path.trim() === '') {
        return '';
    }
    
    // Already a file:// URL
    if (path.startsWith('file://')) {
        return path;
    }
    
    // Already a web URL
    if (path.match(/^https?:\/\//i)) {
        return path;
    }
    
    // Convert local path to file:// URL
    // Windows path (C:\... or C:/...)
    if (path.match(/^[a-zA-Z]:[\\\/]/)) {
        const cleanPath = path.replace(/\\/g, '/');
        return 'file:///' + cleanPath;
    }
    
    // Unix path (/home/...)
    if (path.startsWith('/')) {
        return 'file://' + path;
    }
    
    // Relative path - return as is (will be treated as web URL)
    return path;
}

/**
 * Get icon/emoji for link type
 */
function getLinkIcon(url) {
    if (!url) return '🔗';
    
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        return '▶️';
    }
    if (url.startsWith('file://')) {
        return '📁';
    }
    if (url.includes('github.com')) {
        return '💻';
    }
    if (url.includes('drive.google.com') || url.includes('dropbox.com')) {
        return '☁️';
    }
    
    return '🔗';
}

/**
 * Get link badge class based on URL type
 */
function getLinkBadgeClass(url, defaultType = '') {
    if (!url) return defaultType;
    
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        return 'youtube';
    }
    if (url.startsWith('file://')) {
        return 'local';
    }
    if (url.includes('github.com') || url.includes('gitlab.com')) {
        return 'code';
    }
    
    return defaultType;
}

/**
 * Create a clickable link element with proper handling
 */
function createLinkElement(url, label, badgeClass = '') {
    if (!url || url.trim() === '') {
        return '';
    }
    
    const icon = getLinkIcon(url);
    const cssClass = getLinkBadgeClass(url, badgeClass);
    
    // For file:// URLs, show a note about browser restrictions
    const title = url.startsWith('file://') 
        ? 'Local file link - Some browsers may block this. Try right-click → Copy Link or use File Explorer.'
        : '';
    
    return `<a href="${escapeHtml(url)}" target="_blank" class="link-badge ${cssClass}" title="${title}">${icon} ${label}</a>`;
}

/**
 * Display helpful message about file:// URLs
 */
function showFileUrlInfo() {
    return `
    <div class="info-box">
        <h4>💡 Using Local Folder Links</h4>
        <p><strong>Format:</strong></p>
        <ul>
            <li>Windows: <code>file:///C:/Projects/Arduino</code></li>
            <li>Mac/Linux: <code>file:///home/user/Projects/Arduino</code></li>
            <li>Network: <code>file:////server/share/folder</code></li>
        </ul>
        <p><strong>Note:</strong> Some browsers block file:// links for security. If clicking doesn't work:</p>
        <ul>
            <li>Right-click → "Copy Link Address" → Paste in File Explorer/Finder</li>
            <li>Or use cloud storage links (Google Drive, Dropbox, etc.)</li>
        </ul>
    </div>
    `;
}
