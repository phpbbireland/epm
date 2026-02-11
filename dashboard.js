// Load dashboard data
document.addEventListener('DOMContentLoaded', () => {
    loadDashboardData();
    loadVersion();
});

// Load version number
async function loadVersion() {
    try {
        const response = await fetch('api.php?action=config');
        const result = await response.json();
        
        if (result.success) {
            const version = result.data.version || '1.0.0';
            const versionElement = document.getElementById('app-version');
            if (versionElement) {
                versionElement.textContent = version;
            }
        }
    } catch (error) {
        console.error('Error loading version:', error);
    }
}

async function loadDashboardData() {
    try {
        // Load parts
        const partsResponse = await fetch('api.php?action=all');
        const partsResult = await partsResponse.json();
        
        // Load categories
        const categoriesResponse = await fetch('api.php?action=categories');
        const categoriesResult = await categoriesResponse.json();
        
        if (partsResult.success && categoriesResult.success) {
            const parts = partsResult.data;
            const categories = categoriesResult.data;
            
            // Calculate stats
            const totalParts = parts.length;
            const totalCategories = categories.length;
            
            let inStock = 0;
            let lowStock = 0;
            let outOfStock = 0;
            const lowStockItems = [];
            
            // Get threshold from config
            const threshold = getLowStockThreshold();
            
            parts.forEach(part => {
                const qty = parseInt(part.quantity) || 0;
                if (qty === 0) {
                    outOfStock++;
                    lowStockItems.push({ ...part, status: 'critical' });
                } else if (qty <= threshold) {
                    lowStock++;
                    lowStockItems.push({ ...part, status: 'warning' });
                } else {
                    inStock++;
                }
            });
            
            // Update stats
            document.getElementById('total-parts-count').textContent = totalParts;
            document.getElementById('total-categories-count').textContent = totalCategories;
            document.getElementById('in-stock-count').textContent = inStock;
            document.getElementById('low-stock-count').textContent = lowStock;
            document.getElementById('out-stock-count').textContent = outOfStock;
            
            // Display low stock items
            displayLowStockItems(lowStockItems);
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

function displayLowStockItems(items) {
    const container = document.getElementById('low-stock-items');
    
    if (items.length === 0) {
        container.innerHTML = '<p style="color: #28a745; font-weight: 600;">✅ All parts are well stocked!</p>';
        return;
    }
    
    // Sort by quantity (lowest first)
    items.sort((a, b) => (parseInt(a.quantity) || 0) - (parseInt(b.quantity) || 0));
    
    container.innerHTML = items.map(item => `
        <div class="alert-item ${item.status === 'critical' ? 'critical' : ''}">
            <div class="alert-item-info">
                <h4>${escapeHtml(item.name)}</h4>
                <p>${escapeHtml(item.category_name || 'N/A')} - ${parseInt(item.quantity) || 0} in stock</p>
            </div>
            <a href="parts.html?edit=${item.id}" class="btn btn-edit">Restock</a>
        </div>
    `).join('');
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
