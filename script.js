// DOM Elements - Parts
const partForm = document.getElementById('part-form');
const partId = document.getElementById('part-id');
const nameInput = document.getElementById('name');
const categorySelect = document.getElementById('category');
const quantityInput = document.getElementById('quantity');
const linkInput = document.getElementById('link');
const projectFolderLinkInput = document.getElementById('project-folder-link');
const codeFolderLinkInput = document.getElementById('code-folder-link');
const freecadFolderLinkInput = document.getElementById('freecad-folder-link');
const youtubeLinkInput = document.getElementById('youtube-link');
const descriptionInput = document.getElementById('description');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const formTitle = document.getElementById('form-title');
const searchInput = document.getElementById('search-input');
const partsTbody = document.getElementById('parts-tbody');
const totalCount = document.getElementById('total-count');

// DOM Elements - Categories
const categoryForm = document.getElementById('category-form');
const categoryId = document.getElementById('category-id');
const categoryNameInput = document.getElementById('category-name');
const categoryDescriptionInput = document.getElementById('category-description');
const categorySubmitBtn = document.getElementById('category-submit-btn');
const categoryCancelBtn = document.getElementById('category-cancel-btn');
const categoryFormTitle = document.getElementById('category-form-title');
const categoriesTbody = document.getElementById('categories-tbody');
const categoryCount = document.getElementById('category-count');

// Common
const toast = document.getElementById('toast');

// State
let allParts = [];
let allCategories = [];
let isEditingPart = false;
let isEditingCategory = false;
let currentTab = 'parts';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Only load data if on pages with tables
    if (partsTbody && typeof loadParts === 'function') {
        loadParts();
    }
    
    if (typeof loadCategories === 'function') {
        loadCategories();
    }
    
    // Set up event listeners only if elements exist
    if (partForm) {
        partForm.addEventListener('submit', handlePartSubmit);
    }
    if (cancelBtn) {
        cancelBtn.addEventListener('click', resetPartForm);
    }
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    
    if (categoryForm) {
        categoryForm.addEventListener('submit', handleCategorySubmit);
    }
    categoryCancelBtn.addEventListener('click', resetCategoryForm);
});

// Tab Switching
function switchTab(tab) {
    currentTab = tab;
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase() === tab) {
            btn.classList.add('active');
        }
    });
    
    // Update content sections
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    if (tab === 'parts') {
        document.getElementById('parts-section').classList.add('active');
    } else if (tab === 'categories') {
        document.getElementById('categories-section').classList.add('active');
    }
}

// ============ PARTS FUNCTIONS ============

// Load all parts from API
async function loadParts() {
    if (!partsTbody) return; // Guard - only run on pages with parts table
    
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
    if (!partsTbody || !totalCount) return; // Guard clause
    
    if (parts.length === 0) {
        partsTbody.innerHTML = '<tr><td colspan="7" class="no-data">No parts found. Add your first electronic part!</td></tr>';
        totalCount.textContent = '0';
        return;
    }
    
    partsTbody.innerHTML = parts.map(part => {
        // Determine stock badge
        let stockBadge = '';
        const qty = parseInt(part.quantity) || 0;
        if (qty === 0) {
            stockBadge = '<span class="stock-badge out-of-stock">Out of Stock</span>';
        } else if (qty <= 5) {
            stockBadge = `<span class="stock-badge low-stock">${qty} in stock</span>`;
        } else {
            stockBadge = `<span class="stock-badge in-stock">${qty} in stock</span>`;
        }
        
        // Build links section
        let linksHtml = '<div class="links-cell">';
        if (part.link) {
            linksHtml += `<a href="${escapeHtml(part.link)}" target="_blank" class="link-badge">🔗 Product</a>`;
        }
        if (part.youtube_link) {
            linksHtml += `<a href="${escapeHtml(part.youtube_link)}" target="_blank" class="link-badge youtube">▶️ Video</a>`;
        }
        if (part.project_folder_link) {
            linksHtml += `<a href="${escapeHtml(part.project_folder_link)}" target="_blank" class="link-badge project">📁 Project</a>`;
        }
        if (part.code_folder_link) {
            linksHtml += `<a href="${escapeHtml(part.code_folder_link)}" target="_blank" class="link-badge code">💻 Code</a>`;
        }
        if (part.freecad_folder_link) {
            linksHtml += `<a href="${escapeHtml(part.freecad_folder_link)}" target="_blank" class="link-badge freecad">🔧 CAD</a>`;
        }
        if (!part.link && !part.youtube_link && !part.project_folder_link && !part.code_folder_link && !part.freecad_folder_link) {
            linksHtml += '-';
        }
        linksHtml += '</div>';
        
        return `
            <tr>
                <td>${part.id}</td>
                <td><strong>${escapeHtml(part.name)}</strong></td>
                <td>${escapeHtml(part.category_name || 'N/A')}</td>
                <td>${stockBadge}</td>
                <td>${linksHtml}</td>
                <td>${part.description ? escapeHtml(part.description) : '-'}</td>
                <td>
                    <div class="actions">
                        <button class="btn btn-edit" onclick="editPart(${part.id})">Edit</button>
                        <button class="btn btn-delete" onclick="deletePart(${part.id})">Delete</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    totalCount.textContent = parts.length;
}

// Handle part form submission
async function handlePartSubmit(e) {
    e.preventDefault();
    
    const partData = {
        name: nameInput.value.trim(),
        category_id: parseInt(categorySelect.value),
        quantity: parseInt(quantityInput.value) || 0,
        link: linkInput.value.trim(),
        project_folder_link: projectFolderLinkInput.value.trim(),
        code_folder_link: codeFolderLinkInput.value.trim(),
        freecad_folder_link: freecadFolderLinkInput.value.trim(),
        youtube_link: youtubeLinkInput.value.trim(),
        description: descriptionInput.value.trim()
    };
    
    if (isEditingPart) {
        partData.id = parseInt(partId.value);
        await updatePart(partData);
    } else {
        await createPart(partData);
    }
}

// Create new part
async function createPart(data) {
    try {
        const response = await fetch('api.php?action=create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Part added successfully!', 'success');
            resetPartForm();
            loadParts();
        } else {
            showToast(result.message, 'error');
        }
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

// Update existing part
async function updatePart(data) {
    try {
        const response = await fetch('api.php?action=update', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Part updated successfully!', 'success');
            resetPartForm();
            loadParts();
        } else {
            showToast(result.message, 'error');
        }
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

// Edit part
async function editPart(id) {
    try {
        const response = await fetch(`api.php?action=single&id=${id}`);
        const result = await response.json();
        
        if (result.success) {
            const part = result.data;
            
            partId.value = part.id;
            nameInput.value = part.name;
            categorySelect.value = part.category_id;
            quantityInput.value = part.quantity || 0;
            linkInput.value = part.link || '';
            projectFolderLinkInput.value = part.project_folder_link || '';
            codeFolderLinkInput.value = part.code_folder_link || '';
            freecadFolderLinkInput.value = part.freecad_folder_link || '';
            youtubeLinkInput.value = part.youtube_link || '';
            descriptionInput.value = part.description || '';
            
            isEditingPart = true;
            formTitle.textContent = 'Edit Part';
            submitBtn.textContent = 'Update Part';
            cancelBtn.style.display = 'inline-block';
            
            // Switch to parts tab
            if (currentTab !== 'parts') {
                switchTab('parts');
            }
            
            // Scroll to form
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            showToast(result.message, 'error');
        }
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
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

// Reset part form
function resetPartForm() {
    partForm.reset();
    partId.value = '';
    isEditingPart = false;
    formTitle.textContent = 'Add New Part';
    submitBtn.textContent = 'Add Part';
    cancelBtn.style.display = 'none';
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

// ============ CATEGORIES FUNCTIONS ============

// Load all categories from API
async function loadCategories() {
    try {
        const response = await fetch('api.php?action=categories');
        const result = await response.json();
        
        if (result.success) {
            allCategories = result.data;
            populateCategoryDropdown();
            renderCategories();
        } else {
            showToast('Error loading categories', 'error');
        }
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

// Populate category dropdown for parts form
function populateCategoryDropdown() {
    if (!categorySelect) return; // Guard - only run if dropdown exists
    
    const currentValue = categorySelect.value;
    
    categorySelect.innerHTML = '<option value="">-- Select Category --</option>';
    
    allCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
    });
    
    // Restore previous selection if editing
    if (currentValue) {
        categorySelect.value = currentValue;
    }
}

// Render categories to table
function renderCategories() {
    if (!categoriesTbody || !categoryCount) return; // Guard - only run on category page
    
    if (allCategories.length === 0) {
        categoriesTbody.innerHTML = '<tr><td colspan="5" class="no-data">No categories found. Add your first category!</td></tr>';
        categoryCount.textContent = '0';
        return;
    }
    
    // Count parts per category
    const partCounts = {};
    allParts.forEach(part => {
        partCounts[part.category_id] = (partCounts[part.category_id] || 0) + 1;
    });
    
    categoriesTbody.innerHTML = allCategories.map(category => `
        <tr>
            <td>${category.id}</td>
            <td><strong>${escapeHtml(category.name)}</strong></td>
            <td>${category.description ? escapeHtml(category.description) : '-'}</td>
            <td>${partCounts[category.id] || 0}</td>
            <td>
                <div class="actions">
                    <button class="btn btn-edit" onclick="editCategory(${category.id})">Edit</button>
                    <button class="btn btn-delete" onclick="deleteCategory(${category.id})">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
    
    categoryCount.textContent = allCategories.length;
}

// Handle category form submission
async function handleCategorySubmit(e) {
    e.preventDefault();
    
    const categoryData = {
        name: categoryNameInput.value.trim(),
        description: categoryDescriptionInput.value.trim()
    };
    
    if (isEditingCategory) {
        categoryData.id = parseInt(categoryId.value);
        await updateCategory(categoryData);
    } else {
        await createCategory(categoryData);
    }
}

// Create new category
async function createCategory(data) {
    try {
        const response = await fetch('api.php?action=create_category', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Category added successfully!', 'success');
            resetCategoryForm();
            loadCategories();
        } else {
            showToast(result.message, 'error');
        }
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

// Update existing category
async function updateCategory(data) {
    try {
        const response = await fetch('api.php?action=update_category', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Category updated successfully!', 'success');
            resetCategoryForm();
            loadCategories();
            loadParts(); // Reload parts to show updated category names
        } else {
            showToast(result.message, 'error');
        }
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

// Edit category
async function editCategory(id) {
    try {
        const response = await fetch(`api.php?action=category_single&id=${id}`);
        const result = await response.json();
        
        if (result.success) {
            const category = result.data;
            
            categoryId.value = category.id;
            categoryNameInput.value = category.name;
            categoryDescriptionInput.value = category.description || '';
            
            isEditingCategory = true;
            categoryFormTitle.textContent = 'Edit Category';
            categorySubmitBtn.textContent = 'Update Category';
            categoryCancelBtn.style.display = 'inline-block';
            
            // Scroll to form
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            showToast(result.message, 'error');
        }
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

// Delete category
async function deleteCategory(id) {
    if (!confirm('Are you sure you want to delete this category? You can only delete categories that are not in use.')) {
        return;
    }
    
    try {
        const response = await fetch(`api.php?action=delete_category&id=${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Category deleted successfully!', 'success');
            loadCategories();
        } else {
            showToast(result.message, 'error');
        }
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

// Reset category form
function resetCategoryForm() {
    categoryForm.reset();
    categoryId.value = '';
    isEditingCategory = false;
    categoryFormTitle.textContent = 'Add New Category';
    categorySubmitBtn.textContent = 'Add Category';
    categoryCancelBtn.style.display = 'none';
}

// ============ UTILITY FUNCTIONS ============

// Show toast notification
function showToast(message, type = 'success') {
    if (!toast) return; // Guard against missing toast element
    
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    // Make it clickable to dismiss
    toast.style.cursor = 'pointer';
    toast.title = 'Click to dismiss';
    
    // Remove any existing click handlers
    const newToast = toast.cloneNode(true);
    toast.parentNode.replaceChild(newToast, toast);
    
    // Add click handler to dismiss
    newToast.addEventListener('click', () => {
        newToast.classList.remove('show');
    });
    
    // Auto-dismiss after 10 seconds for success messages
    // Error messages stay until manually dismissed
    if (type === 'success' || type === 'info') {
        setTimeout(() => {
            newToast.classList.remove('show');
        }, 10000);
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
