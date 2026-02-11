// DOM Elements
const subcategoryForm = document.getElementById('subcategory-form');
const formSection = document.getElementById('form-section');
const subcategoryId = document.getElementById('subcategory-id');
const parentId = document.getElementById('parent-id');
const subcategoryNameInput = document.getElementById('subcategory-name');
const subcategoryDescriptionInput = document.getElementById('subcategory-description');
const subcategorySubmitBtn = document.getElementById('subcategory-submit-btn');
const subcategoryCancelBtn = document.getElementById('subcategory-cancel-btn');
const formTitle = document.getElementById('form-title');
const subcategoriesTbody = document.getElementById('subcategories-tbody');
const subcategoryCount = document.getElementById('subcategory-count');
const parentCategoryName = document.getElementById('parent-category-name');
const toast = document.getElementById('toast');

// State
let allSubcategories = [];
let allParts = [];
let isEditingSubcategory = false;
let currentParentId = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Get parent_id from URL
    const urlParams = new URLSearchParams(window.location.search);
    currentParentId = urlParams.get('parent_id');
    
    if (!currentParentId) {
        showToast('No parent category specified', 'error');
        window.location.href = 'categories.html';
        return;
    }
    
    parentId.value = currentParentId;
    
    loadParentCategory();
    loadSubcategories();
    loadParts();
    
    subcategoryForm.addEventListener('submit', handleSubcategorySubmit);
    subcategoryCancelBtn.addEventListener('click', resetSubcategoryForm);
    
    // Check URL parameters
    if (urlParams.get('action') === 'add') {
        toggleForm(true);
    }
});

// Toggle form visibility
function toggleForm(show) {
    if (show === true || !formSection.classList.contains('show')) {
        formSection.classList.add('show');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        formSection.classList.remove('show');
        resetSubcategoryForm();
    }
}

// Load parent category info
async function loadParentCategory() {
    try {
        const response = await fetch(`api.php?action=category_single&id=${currentParentId}`);
        const result = await response.json();
        
        if (result.success) {
            parentCategoryName.textContent = result.data.name;
            document.title = `${result.data.name} - Subcategories`;
        }
    } catch (error) {
        console.error('Error loading parent category:', error);
    }
}

// Load all subcategories
async function loadSubcategories() {
    try {
        const response = await fetch(`api.php?action=subcategories&parent_id=${currentParentId}`);
        const result = await response.json();
        
        if (result.success) {
            allSubcategories = result.data;
            renderSubcategories();
        } else {
            showToast('Error loading subcategories', 'error');
        }
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

// Load all parts (for counting)
async function loadParts() {
    try {
        const response = await fetch('api.php?action=all');
        const result = await response.json();
        
        if (result.success) {
            allParts = result.data;
            renderSubcategories(); // Re-render with part counts
        }
    } catch (error) {
        console.error('Error loading parts:', error);
    }
}

// Render subcategories to table
function renderSubcategories() {
    if (allSubcategories.length === 0) {
        subcategoriesTbody.innerHTML = '<tr><td colspan="7" class="no-data">No subcategories found. Add your first subcategory!</td></tr>';
        subcategoryCount.textContent = '0';
        return;
    }
    
    // Count parts per subcategory
    const partCounts = {};
    allParts.forEach(part => {
        partCounts[part.category_id] = (partCounts[part.category_id] || 0) + 1;
    });
    
    // Count sub-subcategories for each subcategory
    const subSubcategoryCounts = {};
    allSubcategories.forEach(sub => {
        // Count how many subcategories have this as their parent
        const count = allSubcategories.filter(s => s.parent_id === sub.id).length;
        if (count > 0) {
            subSubcategoryCounts[sub.id] = count;
        }
    });
    
    subcategoriesTbody.innerHTML = allSubcategories.map(subcategory => {
        const subSubCount = subSubcategoryCounts[subcategory.id] || 0;
        const manageButton = `<a href="subcategories.html?parent_id=${subcategory.id}" class="btn-view-subs">${subSubCount > 0 ? `View ${subSubCount}` : 'Add'}</a>`;
        
        return `
        <tr>
            <td>${subcategory.id}</td>
            <td><strong>${escapeHtml(subcategory.name)}</strong></td>
            <td>${subcategory.description ? escapeHtml(subcategory.description) : '-'}</td>
            <td>${partCounts[subcategory.id] || 0}</td>
            <td>${subSubCount}</td>
            <td>${manageButton}</td>
            <td>
                <div class="actions">
                    <button class="btn btn-edit" onclick="editSubcategory(${subcategory.id})">Edit</button>
                    <button class="btn btn-delete" onclick="deleteSubcategory(${subcategory.id})">Delete</button>
                </div>
            </td>
        </tr>
    `;
    }).join('');
    
    subcategoryCount.textContent = allSubcategories.length;
}

// Handle subcategory form submission
async function handleSubcategorySubmit(e) {
    e.preventDefault();
    
    const subcategoryData = {
        name: subcategoryNameInput.value.trim(),
        parent_id: parseInt(parentId.value),
        description: subcategoryDescriptionInput.value.trim()
    };
    
    if (isEditingSubcategory) {
        subcategoryData.id = parseInt(subcategoryId.value);
        await updateSubcategory(subcategoryData);
    } else {
        await createSubcategory(subcategoryData);
    }
}

// Create new subcategory
async function createSubcategory(data) {
    try {
        const response = await fetch('api.php?action=create_category', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Subcategory added successfully!', 'success');
            resetSubcategoryForm();
            toggleForm(false);
            loadSubcategories();
        } else {
            showToast(result.message, 'error');
        }
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

// Update existing subcategory
async function updateSubcategory(data) {
    try {
        const response = await fetch('api.php?action=update_category', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Subcategory updated successfully!', 'success');
            resetSubcategoryForm();
            toggleForm(false);
            loadSubcategories();
        } else {
            showToast(result.message, 'error');
        }
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

// Edit subcategory
async function editSubcategory(id) {
    try {
        const response = await fetch(`api.php?action=category_single&id=${id}`);
        const result = await response.json();
        
        if (result.success) {
            const subcategory = result.data;
            
            subcategoryId.value = subcategory.id;
            subcategoryNameInput.value = subcategory.name;
            subcategoryDescriptionInput.value = subcategory.description || '';
            
            isEditingSubcategory = true;
            formTitle.textContent = 'Edit Subcategory';
            subcategorySubmitBtn.textContent = 'Update Subcategory';
            subcategoryCancelBtn.style.display = 'inline-block';
            
            toggleForm(true);
        } else {
            showToast(result.message, 'error');
        }
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

// Delete subcategory
async function deleteSubcategory(id) {
    if (!confirm('Are you sure you want to delete this subcategory? You can only delete subcategories that are not in use.')) {
        return;
    }
    
    try {
        const response = await fetch(`api.php?action=delete_category&id=${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Subcategory deleted successfully!', 'success');
            loadSubcategories();
        } else {
            showToast(result.message, 'error');
        }
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

// Reset subcategory form
function resetSubcategoryForm() {
    subcategoryForm.reset();
    subcategoryId.value = '';
    parentId.value = currentParentId;
    isEditingSubcategory = false;
    formTitle.textContent = 'Add New Subcategory';
    subcategorySubmitBtn.textContent = 'Add Subcategory';
    subcategoryCancelBtn.style.display = 'none';
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
