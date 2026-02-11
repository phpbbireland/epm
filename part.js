// Part viewing JavaScript

let partId = null;
let currentPart = null;

// Get part ID from URL
document.addEventListener('DOMContentLoaded', () => {
    console.log('Part page loaded');
    const urlParams = new URLSearchParams(window.location.search);
    partId = urlParams.get('id');
    
    console.log('Part ID from URL:', partId);
    
    if (!partId) {
        console.error('No part ID provided');
        showError('No part ID provided');
        return;
    }
    
    loadPart(partId);
});

// Load part details
async function loadPart(id) {
    console.log('Loading part with ID:', id);
    try {
        const url = `api.php?action=single&id=${id}`;
        console.log('Fetching:', url);
        
        const response = await fetch(url);
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers.get('content-type'));
        
        // Get the raw text first to see what we're actually getting
        const text = await response.text();
        console.log('Raw response:', text);
        
        // Try to parse as JSON
        let result;
        try {
            result = JSON.parse(text);
            console.log('Parsed JSON:', result);
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            console.error('Response was not valid JSON. Raw text:', text.substring(0, 500));
            showError('Server error: Invalid JSON response. Check console for details.');
            return;
        }
        
        if (result.success && result.data) {
            currentPart = result.data;
            console.log('Part loaded successfully:', currentPart);
            displayPart(result.data);
        } else {
            console.error('Part not found or API error:', result);
            showError(result.message || 'Part not found');
        }
    } catch (error) {
        console.error('Error loading part:', error);
        showError('Error loading part: ' + error.message);
    }
}

// Display part details
function displayPart(part) {
    const container = document.getElementById('part-container');
    const breadcrumb = document.getElementById('part-name-breadcrumb');
    
    // Update breadcrumb
    breadcrumb.textContent = part.name;
    
    // Determine stock status
    let stockBadge = '';
    const qty = parseInt(part.quantity) || 0;
    if (qty === 0) {
        stockBadge = '<span class="stock-badge-large out-of-stock">Out of Stock</span>';
    } else if (qty <= 5) {
        stockBadge = '<span class="stock-badge-large low-stock">' + qty + ' in stock</span>';
    } else {
        stockBadge = '<span class="stock-badge-large in-stock">' + qty + ' in stock</span>';
    }
    
    // Format thumbnail
    let thumbnailHTML = '';
    if (part.thumbnail) {
        thumbnailHTML = `
            <div class="thumbnail-section">
                <img src="uploads/${part.thumbnail}" alt="${escapeHtml(part.name)}" 
                     onerror="this.parentElement.innerHTML='<div class=\\'no-thumbnail\\'>Thumbnail not available</div>'">
            </div>
        `;
    }
    
    // Build HTML
    container.innerHTML = `
        <div class="part-header">
            <div>
                <h2>${escapeHtml(part.name)}</h2>
                <div style="margin-top: 10px;">
                    ${stockBadge}
                </div>
            </div>
            <div class="part-actions">
                <button class="btn btn-primary" onclick="editPart()">✏️ Edit</button>
                <button class="btn btn-delete" onclick="confirmDelete()">🗑️ Delete</button>
            </div>
        </div>
        
        ${thumbnailHTML}
        
        <div class="detail-grid">
            <div class="detail-item">
                <span class="detail-label">Category</span>
                <div class="detail-value">${escapeHtml(part.category_name || 'Uncategorized')}</div>
            </div>
            
            <div class="detail-item">
                <span class="detail-label">Quantity</span>
                <div class="detail-value">${qty}</div>
            </div>
            
            ${part.value ? `
            <div class="detail-item">
                <span class="detail-label">Value</span>
                <div class="detail-value">${escapeHtml(part.value)}</div>
            </div>
            ` : ''}
            
            ${part.size ? `
            <div class="detail-item">
                <span class="detail-label">Size</span>
                <div class="detail-value">${escapeHtml(part.size)}</div>
            </div>
            ` : ''}
            
            ${part.subcategory_name ? `
            <div class="detail-item">
                <span class="detail-label">Subcategory</span>
                <div class="detail-value">${escapeHtml(part.subcategory_name)}</div>
            </div>
            ` : ''}
            
            ${part.description ? `
            <div class="detail-item detail-full">
                <span class="detail-label">Description</span>
                <div class="detail-value">${escapeHtml(part.description)}</div>
            </div>
            ` : ''}
            
            ${part.link ? `
            <div class="detail-item detail-full">
                <span class="detail-label">Datasheet / Purchase Link</span>
                <div class="detail-value">
                    <a href="${escapeHtml(part.link)}" target="_blank" rel="noopener noreferrer">
                        ${escapeHtml(part.link)}
                    </a>
                </div>
            </div>
            ` : ''}
            
            ${part.project_folder_link ? `
            <div class="detail-item detail-full">
                <span class="detail-label">Project Folder</span>
                <div class="detail-value">
                    <a href="${escapeHtml(part.project_folder_link)}" target="_blank" rel="noopener noreferrer">
                        ${escapeHtml(part.project_folder_link)}
                    </a>
                </div>
            </div>
            ` : ''}
            
            ${part.code_folder_link ? `
            <div class="detail-item detail-full">
                <span class="detail-label">Code Folder</span>
                <div class="detail-value">
                    <a href="${escapeHtml(part.code_folder_link)}" target="_blank" rel="noopener noreferrer">
                        ${escapeHtml(part.code_folder_link)}
                    </a>
                </div>
            </div>
            ` : ''}
            
            ${part.freecad_folder_link ? `
            <div class="detail-item detail-full">
                <span class="detail-label">FreeCAD Folder</span>
                <div class="detail-value">
                    <a href="${escapeHtml(part.freecad_folder_link)}" target="_blank" rel="noopener noreferrer">
                        ${escapeHtml(part.freecad_folder_link)}
                    </a>
                </div>
            </div>
            ` : ''}
            
            ${part.youtube_link ? `
            <div class="detail-item detail-full">
                <span class="detail-label">YouTube Tutorial</span>
                <div class="detail-value">
                    <a href="${escapeHtml(part.youtube_link)}" target="_blank" rel="noopener noreferrer">
                        ${escapeHtml(part.youtube_link)}
                    </a>
                </div>
            </div>
            ` : ''}
        </div>
        
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #666; font-size: 0.9em;">
            <strong>Part ID:</strong> ${part.id}
        </div>
    `;
}

// Edit part - redirect to edit page
function editPart() {
    if (partId) {
        window.location.href = `edit-part.html?id=${partId}`;
    }
}

// Confirm delete
function confirmDelete() {
    if (!currentPart) return;
    
    if (confirm(`Are you sure you want to delete "${currentPart.name}"?\n\nThis action cannot be undone.`)) {
        deletePart();
    }
}

// Delete part
async function deletePart() {
    if (!partId) return;
    
    try {
        const response = await fetch('api.php?action=delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `id=${partId}`
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Part deleted successfully', 'success');
            // Redirect to parts list after short delay
            setTimeout(() => {
                window.location.href = 'parts.html';
            }, 1500);
        } else {
            showToast('Error deleting part: ' + (result.message || 'Unknown error'), 'error');
        }
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

// Show error message
function showError(message) {
    const container = document.getElementById('part-container');
    container.innerHTML = `
        <div class="error">
            <h3>Error</h3>
            <p>${escapeHtml(message)}</p>
            <br>
            <a href="parts.html" class="btn btn-secondary">← Back to Parts</a>
        </div>
    `;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        
        toast.style.cursor = 'pointer';
        toast.title = 'Click to dismiss';
        
        const newToast = toast.cloneNode(true);
        toast.parentNode.replaceChild(newToast, toast);
        
        newToast.addEventListener('click', () => {
            newToast.classList.remove('show');
        });
        
        if (type === 'success' || type === 'info') {
            setTimeout(() => {
                newToast.classList.remove('show');
            }, 10000);
        }
    }
}
