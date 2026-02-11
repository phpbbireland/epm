// Global configuration object
window.appConfig = {};

// Load configuration from API or localStorage
async function loadAppConfig() {
    try {
        // Try to load from localStorage first (faster)
        const cachedConfig = localStorage.getItem('appConfig');
        if (cachedConfig) {
            window.appConfig = JSON.parse(cachedConfig);
            applyTheme(window.appConfig.theme || 'light');
        }
        
        // Then fetch latest from API
        const response = await fetch('api.php?action=config');
        const result = await response.json();
        
        if (result.success) {
            window.appConfig = result.data;
            localStorage.setItem('appConfig', JSON.stringify(result.data));
            applyTheme(window.appConfig.theme || 'light');
        }
    } catch (error) {
        console.error('Error loading configuration:', error);
        // Use defaults if loading fails
        window.appConfig = {
            theme: 'dark',
            low_stock_threshold: '2',
            enable_notifications: '1',
            currency_symbol: '€',
            items_per_page: '50',
            date_format: 'DD/MM/YYYY'
        };
    }
}

// Apply theme based on config
function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
}

// Get low stock threshold
function getLowStockThreshold() {
    return parseInt(window.appConfig.low_stock_threshold) || 5;
}

// Check if notifications are enabled
function areNotificationsEnabled() {
    return window.appConfig.enable_notifications === '1';
}

// Load config on page load
loadAppConfig();
