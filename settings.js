// DOM Elements
const versionInput = document.getElementById('version');
const themeSelect = document.getElementById('theme');
const lowStockInput = document.getElementById('low_stock_threshold');
const notificationsSelect = document.getElementById('enable_notifications');
const currencyInput = document.getElementById('currency_symbol');
const itemsPerPageInput = document.getElementById('items_per_page');
const dateFormatSelect = document.getElementById('date_format');
const toast = document.getElementById('toast');

// Configuration object
let appConfig = {};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
});

// Load settings from API
async function loadSettings() {
    try {
        const response = await fetch('api.php?action=config_all');
        const result = await response.json();
        
        if (result.success) {
            result.data.forEach(config => {
                appConfig[config.config_key] = config.config_value;
            });
            
            // Display version
            const versionElement = document.getElementById('app-version');
            if (versionElement) {
                versionElement.textContent = appConfig.version || '1.0.0';
            }
            
            // Populate form
            versionInput.value = appConfig.version || '1.0.0';
            themeSelect.value = appConfig.theme || 'dark';
            lowStockInput.value = appConfig.low_stock_threshold || '2';
            notificationsSelect.value = appConfig.enable_notifications || '1';
            currencyInput.value = appConfig.currency_symbol || '€';
            itemsPerPageInput.value = appConfig.items_per_page || '50';
            dateFormatSelect.value = appConfig.date_format || 'DD/MM/YYYY';
            
            // Apply theme
            applyTheme(appConfig.theme || 'dark');
        }
    } catch (error) {
        showToast('Error loading settings: ' + error.message, 'error');
    }
}

// Save settings
async function saveSettings() {
    const settings = {
        version: versionInput.value,
        theme: themeSelect.value,
        low_stock_threshold: lowStockInput.value,
        enable_notifications: notificationsSelect.value,
        currency_symbol: currencyInput.value,
        items_per_page: itemsPerPageInput.value,
        date_format: dateFormatSelect.value
    };
    
    try {
        // Update each setting
        for (const [key, value] of Object.entries(settings)) {
            const response = await fetch('api.php?action=update_config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    config_key: key,
                    config_value: value
                })
            });
            
            const result = await response.json();
            if (!result.success) {
                throw new Error(`Failed to update ${key}`);
            }
        }
        
        showToast('Settings saved successfully!', 'success');
        
        // Update version badge
        const versionElement = document.getElementById('app-version');
        if (versionElement) {
            versionElement.textContent = settings.version;
        }
        
        // Apply theme immediately
        applyTheme(settings.theme);
        
        // Store theme in localStorage for persistence
        localStorage.setItem('theme', settings.theme);
        localStorage.setItem('appConfig', JSON.stringify(settings));
        
    } catch (error) {
        showToast('Error saving settings: ' + error.message, 'error');
    }
}

// Reset to defaults
async function resetSettings() {
    if (!confirm('Are you sure you want to reset all settings to defaults?')) {
        return;
    }
    
    const defaults = {
        version: '1.0.0',
        theme: 'dark',
        low_stock_threshold: '2',
        enable_notifications: '1',
        currency_symbol: '€',
        items_per_page: '50',
        date_format: 'DD/MM/YYYY'
    };
    
    try {
        for (const [key, value] of Object.entries(defaults)) {
            const response = await fetch('api.php?action=update_config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    config_key: key,
                    config_value: value
                })
            });
            
            const result = await response.json();
            if (!result.success) {
                throw new Error(`Failed to reset ${key}`);
            }
        }
        
        showToast('Settings reset to defaults!', 'success');
        loadSettings();
        
    } catch (error) {
        showToast('Error resetting settings: ' + error.message, 'error');
    }
}

// Apply theme
function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
