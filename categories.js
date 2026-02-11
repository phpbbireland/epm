// DOM Elements
const categoryForm = document.getElementById('category-form');
const formSection = document.getElementById('form-section');
const categoryId = document.getElementById('category-id');
const categoryNameInput = document.getElementById('category-name');
const parentCategorySelect = document.getElementById('parent-category');
const categoryDescriptionInput = document.getElementById('category-description');
const categorySubmitBtn = document.getElementById('category-submit-btn');
const categoryCancelBtn = document.getElementById('category-cancel-btn');
const categoryFormTitle = document.getElementById('category-form-title');
const categoriesTbody = document.getElementById('categories-tbody');
const categoryCount = document.getElementById('category-count');
const toast = document.getElementById('toast');

// State
let allCategories = [];
let allParts = [];
let isEditingCategory = false;
let showSubcategories = false; // View state for showing/hiding subcategories

// Cookie helper functions
function setCookie(name, value, days = 365) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Load view preference from cookie
    const savedView = getCookie('showSubcategories');
    showSubcategories = savedView === 'true';
    updateToggleButton();
    
    loadCategories();
    loadParts();
    
    categoryForm.addEventListener('submit', handleCategorySubmit);
    categoryCancelBtn.addEventListener('click', resetCategoryForm);
    
    // Check URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'add') {
        toggleForm(true);
    }
});

// Toggle form visibility
function toggleForm(show) {
    if (show === true || !formSection.classList.contains('show')) {
        formSection.classList.add('show');
        // Make sure dropdown is populated when opening form
        if (allCategories.length > 0) {
            populateParentDropdown();
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        formSection.classList.remove('show');
        resetCategoryForm();
    }
}

// Toggle subcategory view
function toggleSubcategoryView() {
    showSubcategories = !showSubcategories;
    setCookie('showSubcategories', showSubcategories);
    updateToggleButton();
    renderCategories();
}

// Update toggle button text and icon
function updateToggleButton() {
    const toggleBtn = document.getElementById('toggle-view-btn');
    const toggleIcon = document.getElementById('toggle-icon');
    const toggleText = document.getElementById('toggle-text');
    
    if (showSubcategories) {
        toggleIcon.textContent = '🙈';
        toggleText.textContent = 'Hide Subcategories';
        toggleBtn.classList.add('active');
    } else {
        toggleIcon.textContent = '👁️';
        toggleText.textContent = 'Show Subcategories';
        toggleBtn.classList.remove('active');
    }
}

// Load all categories
async function loadCategories() {
    try {
        const response = await fetch('api.php?action=categories');
        const result = await response.json();
        
        if (result.success) {
            allCategories = result.data;
            renderCategories();
        } else {
            showToast('Error loading categories', 'error');
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
            renderCategories(); // Re-render with part counts
        }
    } catch (error) {
        console.error('Error loading parts:', error);
    }
}

// Render categories to table
function renderCategories() {
    if (allCategories.length === 0) {
        categoriesTbody.innerHTML = '<tr><td colspan="7" class="no-data">No categories found. Add your first category!</td></tr>';
        categoryCount.textContent = '0';
        return;
    }
    
    // Count parts per category
    const partCounts = {};
    allParts.forEach(part => {
        partCounts[part.category_id] = (partCounts[part.category_id] || 0) + 1;
    });
    
    // Count subcategories per category
    const subcategoryCounts = {};
    allCategories.forEach(cat => {
        if (cat.parent_id) {
            subcategoryCounts[cat.parent_id] = (subcategoryCounts[cat.parent_id] || 0) + 1;
        }
    });
    
    // Populate parent category dropdown (only top-level categories)
    populateParentDropdown();
    
    let categoriesToShow = [];
    
    if (showSubcategories) {
        // Show hierarchical view: parents with their subcategories
        const parentCategories = allCategories
            .filter(cat => !cat.parent_id)
            .sort((a, b) => a.name.localeCompare(b.name));
        
        parentCategories.forEach(parent => {
            categoriesToShow.push(parent);
            
            const childCategories = allCategories
                .filter(cat => cat.parent_id === parent.id)
                .sort((a, b) => a.name.localeCompare(b.name));
            
            categoriesToShow.push(...childCategories);
        });
        
        // Add orphaned subcategories
        const orphanedSubcategories = allCategories
            .filter(cat => {
                if (!cat.parent_id) return false;
                return !allCategories.some(parent => parent.id === cat.parent_id);
            })
            .sort((a, b) => a.name.localeCompare(b.name));
        
        categoriesToShow.push(...orphanedSubcategories);
    } else {
        // Show only parent categories
        categoriesToShow = allCategories
            .filter(cat => !cat.parent_id)
            .sort((a, b) => a.name.localeCompare(b.name));
    }
    
    if (categoriesToShow.length === 0) {
        categoriesTbody.innerHTML = '<tr><td colspan="7" class="no-data">No parent categories found. All categories are subcategories!</td></tr>';
        categoryCount.textContent = '0';
        return;
    }
    
    categoriesTbody.innerHTML = categoriesToShow.map(category => {
        const subCount = subcategoryCounts[category.id] || 0;
        const isParent = !category.parent_id;
        
        // Button to view subcategories (only for parent categories when not showing subs)
        let subButton;
        if (isParent && !showSubcategories) {
            subButton = `<a href="subcategories.html?parent_id=${category.id}" class="btn-view-subs">${subCount > 0 ? `View ${subCount}` : 'Add'}</a>`;
        } else if (isParent && showSubcategories) {
            subButton = subCount > 0 ? `<span class="sub-count">${subCount}</span>` : '-';
        } else {
            subButton = '-';
        }
        
        // Name display with indentation for subcategories
        const nameDisplay = category.parent_id 
            ? `<span class="subcategory-indent">↳</span> ${escapeHtml(category.name)}`
            : `<strong>${escapeHtml(category.name)}</strong>`;
        
        const rowClass = category.parent_id ? 'subcategory-row' : 'parent-row';
        
        return `
            <tr class="${rowClass}">
                <td style="display: none;">${category.id}</td>
                <td>${nameDisplay}</td>
                <td>${category.description ? escapeHtml(category.description) : '-'}</td>
                <td>${partCounts[category.id] || 0}</td>
                <td>${subCount}</td>
                <td>${subButton}</td>
                <td>
                    <div class="actions">
                        <button class="btn btn-edit" onclick="editCategory(${category.id})">Edit</button>
                        <button class="btn btn-delete" onclick="deleteCategory(${category.id})">Delete</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    categoryCount.textContent = showSubcategories ? allCategories.length : categoriesToShow.length;
}

// Populate parent category dropdown
function populateParentDropdown() {
    const currentValue = parentCategorySelect.value;
    const editingId = categoryId.value ? parseInt(categoryId.value) : null;
    
    parentCategorySelect.innerHTML = '<option value="">-- None (Top Level Category) --</option>';
    
    // Only show top-level categories (parent_id is null or empty)
    const topLevelCategories = allCategories.filter(cat => !cat.parent_id);
    
    topLevelCategories.forEach(category => {
        // Don't show the category being edited as a parent option
        if (editingId && editingId === category.id) {
            return;
        }
        
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        parentCategorySelect.appendChild(option);
    });
    
    // Restore previous selection if it exists and is valid
    if (currentValue) {
        const optionExists = Array.from(parentCategorySelect.options).some(opt => opt.value === currentValue);
        if (optionExists) {
            parentCategorySelect.value = currentValue;
        }
    }
}

// Handle category form submission
async function handleCategorySubmit(e) {
    e.preventDefault();
    
    const categoryData = {
        name: categoryNameInput.value.trim(),
        parent_id: parentCategorySelect.value || null,
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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Category added successfully!', 'success');
            resetCategoryForm();
            toggleForm(false);
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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Category updated successfully!', 'success');
            resetCategoryForm();
            toggleForm(false);
            loadCategories();
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
            
            // Refresh parent dropdown to exclude current category
            populateParentDropdown();
            
            // Set parent value (handle both null and numeric values)
            if (category.parent_id) {
                parentCategorySelect.value = category.parent_id;
            } else {
                parentCategorySelect.value = '';
            }
            
            isEditingCategory = true;
            categoryFormTitle.textContent = 'Edit Category';
            categorySubmitBtn.textContent = 'Update Category';
            categoryCancelBtn.style.display = 'inline-block';
            
            toggleForm(true);
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
