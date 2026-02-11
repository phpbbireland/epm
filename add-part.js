// DOM Elements
const addPartForm = document.getElementById('add-part-form');
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
let uploadedThumbnail = '';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    addPartForm.addEventListener('submit', handleSubmit);
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
        document.getElementById('thumbnail-preview-img').src = e.target.result;
        document.getElementById('thumbnail-preview').style.display = 'block';
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
            document.getElementById('thumbnail-preview').style.display = 'none';
        }
    } catch (error) {
        showToast('Error uploading image: ' + error.message, 'error');
        thumbnailInput.value = '';
        document.getElementById('thumbnail-preview').style.display = 'none';
    }
}

// Remove thumbnail
function removeThumbnail() {
    thumbnailInput.value = '';
    uploadedThumbnail = '';
    document.getElementById('thumbnail-preview').style.display = 'none';
    document.getElementById('thumbnail-preview-img').src = '';
}

// Handle form submission
async function handleSubmit(e) {
    e.preventDefault();
    
    const partData = {
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
        const response = await fetch('api.php?action=create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(partData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Part added successfully!', 'success');
            // Redirect to parts page after a short delay
            setTimeout(() => {
                window.location.href = 'parts.html';
            }, 1500);
        } else {
            showToast(result.message, 'error');
        }
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

// Cancel add and return to parts list
function cancelAdd() {
    if (confirm('Discard this new part and return to parts list?')) {
        window.location.href = 'parts.html';
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
