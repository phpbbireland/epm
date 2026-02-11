// DOM Elements
const searchInput = document.getElementById('search-input');
const partsTbody = document.getElementById('parts-tbody');
const totalCount = document.getElementById('total-count');
const toast = document.getElementById('toast');

// State
let allParts = [];
let allCategories = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadParts();
    searchInput.addEventListener('input', handleSearch);
});

// Load all categories
async function loadCategories() {
    try {
        const response = await fetch('api.php?action=categories');
        const result = await response.json();
        
        if (result.success) {
            allCategories = result.data;
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Load all parts
async function loadParts() {
    try {
        const response = await fetch('api.php?action=all');
        const result = await response.json();
        
        if (result.success) {
            allParts = result.data;
            renderParts(allParts);
        } else {
            showToast('Error loading parts', 'error');
        }
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

// Render parts to table
function renderParts(parts) {
    if (parts.length === 0) {
        partsTbody.innerHTML = '<tr><td colspan="10" class="no-data">No parts found. Add your first electronic part!</td></tr>';
        totalCount.textContent = '0';
        return;
    }
    
    partsTbody.innerHTML = parts.map(part => {
        // Determine stock badge
        let stockBadge = '';
        const qty = parseInt(part.quantity) || 0;
        const threshold = getLowStockThreshold();
        
        if (qty === 0) {
            stockBadge = '<span class="stock-badge out-of-stock">Out of Stock</span>';
        } else if (qty <= threshold) {
            stockBadge = `<span class="stock-badge low-stock">${qty} in stock</span>`;
        } else {
            stockBadge = `<span class="stock-badge in-stock">${qty} in stock</span>`;
        }
        
        // Build links section
        let linksHtml = '<div class="links-cell">';
        if (part.link) {
            const isLocal = part.link.startsWith('file://');
            const linkClass = isLocal ? 'local' : '';
            const linkTitle = isLocal ? 'Local file link - May be blocked by browser. Right-click to copy.' : '';
            linksHtml += `<a href="${escapeHtml(part.link)}" target="_blank" class="link-badge ${linkClass}" title="${linkTitle}">🔗 Product</a>`;
        }
        if (part.youtube_link) {
            linksHtml += `<a href="${escapeHtml(part.youtube_link)}" target="_blank" class="link-badge youtube">▶️ Video</a>`;
        }
        if (part.project_folder_link) {
            linksHtml += `<button onclick="copyLinkToClipboard('${escapeHtml(part.project_folder_link)}', 'Project folder')" class="link-badge project" title="Click to copy project folder link">📁 Project</button>`;
        }
        if (part.code_folder_link) {
            linksHtml += `<button onclick="copyLinkToClipboard('${escapeHtml(part.code_folder_link)}', 'Code folder')" class="link-badge code" title="Click to copy code folder link">💻 Code</button>`;
        }
        if (part.freecad_folder_link) {
            linksHtml += `<button onclick="copyLinkToClipboard('${escapeHtml(part.freecad_folder_link)}', 'FreeCAD folder')" class="link-badge freecad" title="Click to copy FreeCAD folder link">🔧 CAD</button>`;
        }
        if (!part.link && !part.youtube_link && !part.project_folder_link && !part.code_folder_link && !part.freecad_folder_link) {
            linksHtml += '-';
        }
        linksHtml += '</div>';
        
        // Thumbnail with hover preview
        let thumbnailHtml = '-';
        if (part.thumbnail) {
            const originalSrc = `uploads/${escapeHtml(part.thumbnail)}`;
            const thumbnailSrc = `uploads/thumb_${escapeHtml(part.thumbnail)}`;
            thumbnailHtml = `
                <div class="thumbnail-container" onmouseenter="showThumbnailPreview(event)" onmouseleave="hideThumbnailPreview(event)">
                    <img src="${thumbnailSrc}" alt="${escapeHtml(part.name)}" class="part-thumbnail">
                    <div class="thumbnail-hover-preview">
                        <img src="${originalSrc}" alt="${escapeHtml(part.name)}">
                    </div>
                </div>
            `;
        }
        
        return `
            <tr>
                <td style="display: none;">${part.id}</td>
                <td>${thumbnailHtml}</td>
                <td><strong><a href="part.html?id=${part.id}" style="color: #667eea; text-decoration: none;">${escapeHtml(part.name)}</a></strong></td>
                <td>${escapeHtml(part.category_name || 'N/A')}</td>
                <td>${stockBadge}</td>
                <td>${part.value ? escapeHtml(part.value) : '-'}</td>
                <td>${part.size ? escapeHtml(part.size) : '-'}</td>
                <td>${linksHtml}</td>
                <td>${part.description ? escapeHtml(part.description) : '-'}</td>
                <td>
                    <div class="actions">
                        <button class="btn btn-view" onclick="viewPart(${part.id})">View</button>
                        <button class="btn btn-edit" onclick="editPart(${part.id})">Edit</button>
                        <button class="btn btn-delete" onclick="deletePart(${part.id})">Delete</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    totalCount.textContent = parts.length;
}

// Edit part - redirect to dedicated edit page
// View part details
function viewPart(id) {
    window.location.href = `part.html?id=${id}`;
}

function editPart(id) {
    window.location.href = `edit-part.html?id=${id}`;
}

// Delete part
async function deletePart(id) {
    if (!confirm('Are you sure you want to delete this part?')) {
        return;
    }
    
    try {
        const response = await fetch(`api.php?action=delete&id=${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Part deleted successfully!', 'success');
            loadParts();
        } else {
            showToast(result.message, 'error');
        }
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

// Handle search
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    
    const filteredParts = allParts.filter(part => {
        return part.name.toLowerCase().includes(searchTerm) ||
               (part.category_name && part.category_name.toLowerCase().includes(searchTerm)) ||
               (part.description && part.description.toLowerCase().includes(searchTerm));
    });
    
    renderParts(filteredParts);
}

// Show toast notification
function showToast(message, type = 'success') {
    if (!areNotificationsEnabled()) {
        return;
    }
    
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show thumbnail preview on hover
function showThumbnailPreview(event) {
    const container = event.currentTarget;
    const preview = container.querySelector('.thumbnail-hover-preview');
    
    if (preview) {
        const rect = container.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const windowWidth = window.innerWidth;
        
        // Show preview first to get its dimensions
        preview.style.display = 'block';
        preview.style.visibility = 'hidden'; // Hide while measuring
        
        // Wait for next frame to get accurate dimensions
        requestAnimationFrame(() => {
            const previewRect = preview.getBoundingClientRect();
            
            // Calculate horizontal position (default: to the right)
            let left = rect.right + 20;
            
            // If preview would go off right edge, show to the left instead
            if (left + previewRect.width > windowWidth) {
                left = rect.left - previewRect.width - 20;
            }
            
            // Calculate vertical position
            let top = rect.top - 50;
            
            // If preview would go off bottom, adjust upward
            if (top + previewRect.height > windowHeight - 20) {
                top = windowHeight - previewRect.height - 20;
            }
            
            // If preview would go off top, adjust downward
            if (top < 20) {
                top = 20;
            }
            
            // Apply final position
            preview.style.left = left + 'px';
            preview.style.top = top + 'px';
            preview.style.visibility = 'visible'; // Show after positioning
        });
    }
}

// Hide thumbnail preview
function hideThumbnailPreview(event) {
    const container = event.currentTarget;
    const preview = container.querySelector('.thumbnail-hover-preview');
    
    if (preview) {
        preview.style.display = 'none';
    }
}

// Copy link to clipboard
function copyLinkToClipboard(link, linkType) {
    // Prevent event bubbling
    event.preventDefault();
    event.stopPropagation();
    
    const button = event.currentTarget;
    
    try {
        navigator.clipboard.writeText(link).then(() => {
            // Visual feedback
            button.classList.add('copied');
            const originalText = button.innerHTML;
            button.innerHTML = '✓ Copied!';
            
            showToast(`${linkType} link copied to clipboard!`, 'success');
            
            // Reset button after animation
            setTimeout(() => {
                button.classList.remove('copied');
                button.innerHTML = originalText;
            }, 2000);
            
            // Show additional help for file:// links
            if (link.startsWith('file://')) {
                setTimeout(() => {
                    showToast('Paste the link into your file explorer or browser address bar', 'success');
                }, 3500);
            }
        }).catch(() => {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = link;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            
            // Visual feedback
            button.classList.add('copied');
            const originalText = button.innerHTML;
            button.innerHTML = '✓ Copied!';
            
            showToast(`${linkType} link copied to clipboard!`, 'success');
            
            setTimeout(() => {
                button.classList.remove('copied');
                button.innerHTML = originalText;
            }, 2000);
        });
    } catch (err) {
        showToast('Failed to copy link. Please try again.', 'error');
        console.error('Copy error:', err);
    }
}
