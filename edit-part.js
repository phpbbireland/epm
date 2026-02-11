// DOM Elements
const editPartForm = document.getElementById('edit-part-form');
const partId = document.getElementById('part-id');
const nameInput = document.getElementById('name');
const categorySelect = document.getElementById('category');
const quantityInput = document.getElementById('quantity');
const valueInput = document.getElementById('value');
const sizeInput = document.getElementById('size');
const thumbnailInput = document.getElementById('thumbnail');
const linkInput = document.getElementById('link');
const projectFolderLinkInput = document.getElementById('project-folder-link');
const codeFolderLinkInput = document.getElementById('code-folder-link');
const freecadFolderLinkInput = document.getElementById('freecad-folder-link');
const youtubeLinkInput = document.getElementById('youtube-link');
const descriptionInput = document.getElementById('description');
const toast = document.getElementById('toast');

// State
let allCategories = [];
let currentPart = null;
let uploadedThumbnail = '';

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Get part ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const partIdParam = urlParams.get('id');
    
    if (!partIdParam) {
        showToast('No part ID specified', 'error');
        setTimeout(() => {
            window.location.href = 'parts.html';
        }, 2000);
        return;
    }
    
    // Load categories first, then load part
    await loadCategories();
    await loadPart(partIdParam);
    
    editPartForm.addEventListener('submit', handleSubmit);
    thumbnailInput.addEventListener('change', handleThumbnailChange);
});

// Load all categories
async function loadCategories() {
    try {
        const response = await fetch('api.php?action=categories');
        const result = await response.json();
        
        if (result.success) {
            allCategories = result.data;
            populateCategoryDropdown();
        }
    } catch (error) {
        showToast('Error loading categories', 'error');
    }
}

// Populate category dropdown with hierarchical structure
function populateCategoryDropdown() {
    categorySelect.innerHTML = '<option value="">-- Select Category --</option>';
    
    const buildTree = (parentId = null, level = 0) => {
        const children = allCategories.filter(c => {
            if (parentId === null) {
                return c.parent_id === null || c.parent_id === undefined || c.parent_id === '' || c.parent_id === 0 || c.parent_id === '0';
            }
            return parseInt(c.parent_id) === parseInt(parentId);
        });
        children.sort((a, b) => a.name.localeCompare(b.name));
        
        children.forEach(category => {
            const indent = '　'.repeat(level);
            const prefix = level > 0 ? '└─ ' : '';
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = indent + prefix + category.name;
            categorySelect.appendChild(option);
            
            buildTree(category.id, level + 1);
        });
    };
    
    buildTree();
}

// Load part data
async function loadPart(id) {
    try {
        const response = await fetch(`api.php?action=single&id=${id}`);
        const result = await response.json();
        
        if (result.success) {
            currentPart = result.data;
            populateForm(currentPart);
            updatePartInfo(currentPart);
        } else {
            showToast('Part not found', 'error');
            setTimeout(() => {
                window.location.href = 'parts.html';
            }, 2000);
        }
    } catch (error) {
        showToast('Error loading part: ' + error.message, 'error');
    }
}

// Populate form with part data
function populateForm(part) {
    partId.value = part.id;
    nameInput.value = part.name;
    
    // Set category - use setTimeout as fallback if options not yet loaded
    categorySelect.value = part.category_id;
    if (!categorySelect.value && part.category_id) {
        // If value didn't set, try again after a brief delay
        setTimeout(() => {
            categorySelect.value = part.category_id;
        }, 100);
    }
    
    quantityInput.value = part.quantity || 0;
    valueInput.value = part.value || '';
    sizeInput.value = part.size || '';
    linkInput.value = part.link || '';
    
    // Set thumbnail
    uploadedThumbnail = part.thumbnail || '';
    const removeBtn = document.querySelector('.btn-remove-thumb-inline');
    const thumbnailImg = document.getElementById('thumbnail-preview-img');
    const thumbnailArea = document.querySelector('.thumbnail-click-area');
    
    if (part.thumbnail) {
        thumbnailImg.src = 'uploads/thumb_' + part.thumbnail;
        thumbnailImg.title = 'Click to change thumbnail';
        if (thumbnailArea) thumbnailArea.classList.add('has-image');
        if (removeBtn) removeBtn.style.display = 'block';
    } else {
        // Reset to upload icon
        thumbnailImg.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Crect width='48' height='48' fill='%23f0f0f0' rx='4'/%3E%3Cpath d='M24 14v20M14 24h20' stroke='%23999' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E";
        thumbnailImg.title = 'Click to upload thumbnail';
        if (thumbnailArea) thumbnailArea.classList.remove('has-image');
        if (removeBtn) removeBtn.style.display = 'none';
    }
    projectFolderLinkInput.value = part.project_folder_link || '';
    codeFolderLinkInput.value = part.code_folder_link || '';
    freecadFolderLinkInput.value = part.freecad_folder_link || '';
    youtubeLinkInput.value = part.youtube_link || '';
    descriptionInput.value = part.description || '';
    
    // Update title and breadcrumb
    document.getElementById('edit-part-title').textContent = `Edit: ${part.name}`;
    document.getElementById('part-name-breadcrumb').textContent = part.name;
}

// Update part info card
function updatePartInfo(part) {
    document.getElementById('display-id').textContent = part.id;
    document.getElementById('display-category').textContent = part.category_name || 'Unknown';
    
    // Stock status
    const quantity = parseInt(part.quantity) || 0;
    const lowStockThreshold = parseInt(getLowStockThreshold()) || 2;
    let stockHtml = '';
    
    if (quantity === 0) {
        stockHtml = '<span class="stock-badge out-of-stock">Out of Stock</span>';
    } else if (quantity <= lowStockThreshold) {
        stockHtml = `<span class="stock-badge low-stock">Low Stock (${quantity})</span>`;
    } else {
        stockHtml = `<span class="stock-badge in-stock">In Stock (${quantity})</span>`;
    }
    
    document.getElementById('display-stock').innerHTML = stockHtml;
    document.getElementById('display-created').textContent = formatDate(part.created_at);
    document.getElementById('display-updated').textContent = formatDate(part.updated_at);
}

// Handle thumbnail file selection
async function handleThumbnailChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'error');
        thumbnailInput.value = '';
        return;
    }
    
    // Validate file size (250KB max)
    if (file.size > 250 * 1024) {
        showToast('Image too large. Maximum size is 250KB', 'error');
        thumbnailInput.value = '';
        return;
    }
    
    // Show preview
    const reader = new FileReader();
    reader.onload = function(e) {
        const thumbnailImg = document.getElementById('thumbnail-preview-img');
        const thumbnailArea = document.querySelector('.thumbnail-click-area');
        
        thumbnailImg.src = e.target.result;
        thumbnailImg.title = 'Click to change thumbnail';
        if (thumbnailArea) thumbnailArea.classList.add('has-image');
        
        // Show inline remove button
        const removeBtn = document.querySelector('.btn-remove-thumb-inline');
        if (removeBtn) removeBtn.style.display = 'block';
    };
    reader.readAsDataURL(file);
    
    // Upload image
    const formData = new FormData();
    formData.append('thumbnail', file);
    
    try {
        const response = await fetch('upload.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            uploadedThumbnail = result.filename;
            showToast('Image uploaded successfully', 'success');
        } else {
            showToast(result.message, 'error');
            thumbnailInput.value = '';
        }
    } catch (error) {
        showToast('Error uploading image: ' + error.message, 'error');
        thumbnailInput.value = '';
    }
}

// Remove thumbnail
function removeThumbnail() {
    thumbnailInput.value = '';
    uploadedThumbnail = '';
    
    const thumbnailImg = document.getElementById('thumbnail-preview-img');
    const thumbnailArea = document.querySelector('.thumbnail-click-area');
    
    // Reset to upload icon
    thumbnailImg.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Crect width='48' height='48' fill='%23f0f0f0' rx='4'/%3E%3Cpath d='M24 14v20M14 24h20' stroke='%23999' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E";
    thumbnailImg.title = 'Click to upload thumbnail';
    
    if (thumbnailArea) thumbnailArea.classList.remove('has-image');
    
    // Hide inline remove button if it exists
    const removeBtn = document.querySelector('.btn-remove-thumb-inline');
    if (removeBtn) {
        removeBtn.style.display = 'none';
    }
}

// Format date
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString();
}

// Handle form submission
async function handleSubmit(e) {
    e.preventDefault();
    
    const partData = {
        id: parseInt(partId.value),
        name: nameInput.value.trim(),
        category_id: parseInt(categorySelect.value),
        quantity: parseInt(quantityInput.value) || 0,
        value: valueInput.value.trim(),
        size: sizeInput.value.trim(),
        thumbnail: uploadedThumbnail,
        link: linkInput.value.trim(),
        project_folder_link: projectFolderLinkInput.value.trim(),
        code_folder_link: codeFolderLinkInput.value.trim(),
        freecad_folder_link: freecadFolderLinkInput.value.trim(),
        youtube_link: youtubeLinkInput.value.trim(),
        description: descriptionInput.value.trim()
    };
    
    try {
        const response = await fetch('api.php?action=update', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(partData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Part updated successfully!', 'success');
            // Reload part data to update info card
            setTimeout(() => {
                loadPart(partId.value);
            }, 1000);
        } else {
            showToast(result.message, 'error');
        }
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

// Cancel edit and return to parts list
function cancelEdit() {
    if (confirm('Discard changes and return to parts list?')) {
        window.location.href = 'parts.html';
    }
}

// Show move modal
function showMoveModal() {
    if (!currentPart) {
        showToast('Part data not loaded', 'error');
        return;
    }
    
    document.getElementById('move-part-name').textContent = currentPart.name;
    
    const currentCategory = allCategories.find(c => c.id === currentPart.category_id);
    document.getElementById('current-category-name').textContent = currentCategory ? currentCategory.name : 'Unknown';
    
    populateCategoryTree(currentPart.category_id);
    
    document.getElementById('move-modal').classList.add('show');
}

// Close move modal
function closeMoveModal() {
    document.getElementById('move-modal').classList.remove('show');
}

// Populate category tree for move modal
function populateCategoryTree(excludeCategoryId) {
    const select = document.getElementById('move-category-select');
    select.innerHTML = '<option value="">-- Select Category --</option>';
    
    if (!allCategories || allCategories.length === 0) {
        showToast('Categories not loaded', 'error');
        return;
    }
    
    const buildTree = (parentId = null, level = 0) => {
        const children = allCategories.filter(c => {
            const categoryParentId = c.parent_id;
            
            if (parentId === null) {
                return categoryParentId === null || 
                       categoryParentId === undefined || 
                       categoryParentId === '' || 
                       categoryParentId === 0 ||
                       categoryParentId === '0';
            }
            return parseInt(categoryParentId) === parseInt(parentId);
        });
        
        children.sort((a, b) => a.name.localeCompare(b.name));
        
        children.forEach(category => {
            const indent = '　'.repeat(level);
            const prefix = level > 0 ? '└─ ' : '';
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = indent + prefix + category.name;
            
            if (parseInt(category.id) === parseInt(excludeCategoryId)) {
                option.disabled = true;
                option.textContent += ' (current)';
            }
            
            select.appendChild(option);
            buildTree(category.id, level + 1);
        });
    };
    
    buildTree();
}

// Confirm move part
async function confirmMovePart() {
    const newCategoryId = document.getElementById('move-category-select').value;
    
    if (!newCategoryId) {
        showToast('Please select a destination category', 'error');
        return;
    }
    
    try {
        const response = await fetch('api.php?action=move_part', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: parseInt(partId.value),
                category_id: parseInt(newCategoryId)
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Part moved successfully!', 'success');
            closeMoveModal();
            // Update category select
            categorySelect.value = newCategoryId;
            // Reload part data
            loadPart(partId.value);
        } else {
            showToast(result.message, 'error');
        }
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    if (!areNotificationsEnabled()) {
        return;
    }
    
    toast.textContent = message;
    toast.className = 'toast show ' + type;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
