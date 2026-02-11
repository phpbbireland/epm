// Style Editor JavaScript

// Color configuration
const defaultColors = {
    background: '#f5f7fa',
    text: '#333333',
    header: '#667eea',
    'header-text': '#ffffff',
    'btn-primary': '#667eea',
    'btn-primary-hover': '#5568d3',
    'btn-secondary': '#6c757d',
    'btn-secondary-hover': '#5a6268',
    'card-background': '#ffffff',
    'card-border': '#dee2e6',
    accent: '#667eea',
    link: '#667eea',
    'link-hover': '#5568d3'
};

let currentColors = { ...defaultColors };
let colorPickers = {}; // Store Pickr instances

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadColors();
    
    // Check if Pickr is loaded, use it, otherwise fallback to native
    setTimeout(() => {
        if (typeof Pickr !== 'undefined') {
            setupPickrColorPickers();
        } else {
            setupColorInputs();
        }
    }, 100);
    
    updatePreview();
    generateCSS();
});

// Load saved colors from localStorage
function loadColors() {
    const saved = localStorage.getItem('customColors');
    if (saved) {
        try {
            currentColors = JSON.parse(saved);
            // Update color inputs, previews, hex displays, and Pickr instances
            Object.keys(currentColors).forEach(key => {
                const input = document.getElementById(`color-${key}`);
                const preview = document.getElementById(`preview-${key}`);
                const hexDisplay = document.getElementById(`hex-${key}`);
                
                if (input) input.value = currentColors[key];
                if (preview) preview.style.background = currentColors[key];
                if (hexDisplay) hexDisplay.textContent = currentColors[key].toUpperCase();
                
                // Update Pickr instance if it exists
                if (colorPickers[key]) {
                    colorPickers[key].setColor(currentColors[key]);
                }
            });
        } catch (e) {
            console.error('Error loading colors:', e);
        }
    }
}

// Save colors to localStorage
function saveColors() {
    localStorage.setItem('customColors', JSON.stringify(currentColors));
}

// Setup Pickr color pickers (advanced color picker with palette)
function setupPickrColorPickers() {
    Object.keys(defaultColors).forEach(key => {
        const preview = document.getElementById(`preview-${key}`);
        const input = document.getElementById(`color-${key}`);
        
        if (preview) {
            // Hide native input if using Pickr
            if (input) input.style.display = 'none';
            
            const pickr = Pickr.create({
                el: preview,
                theme: 'nano',
                default: currentColors[key],
                swatches: [
                    // Grayscale
                    '#ffffff', '#f8f9fa', '#e9ecef', '#dee2e6',
                    '#ced4da', '#adb5bd', '#6c757d', '#495057',
                    '#343a40', '#212529', '#000000',
                    // Purple/Blue
                    '#667eea', '#5568d3', '#764ba2', '#4834df',
                    // Greens
                    '#28a745', '#20c997', '#4ecdc4', '#1dd1a1',
                    // Reds/Oranges
                    '#dc3545', '#ff6b6b', '#ee5a6f', '#ff6348',
                    // Yellows
                    '#ffc107', '#fed330', '#f9ca24', '#f0932b',
                    // Blues/Teals
                    '#17a2b8', '#54a0ff', '#00d2d3', '#64ffda',
                    // Pinks/Purples
                    '#f093fb', '#c44569', '#a29bfe', '#fd79a8'
                ],
                components: {
                    preview: true,
                    opacity: false,
                    hue: true,
                    interaction: {
                        hex: true,
                        rgba: false,
                        hsla: false,
                        hsva: false,
                        cmyk: false,
                        input: true,
                        clear: false,
                        save: true
                    }
                }
            });
            
            // Handle color save (when user clicks Save button)
            pickr.on('save', (color, instance) => {
                if (color) {
                    const hexColor = color.toHEXA().toString();
                    currentColors[key] = hexColor;
                    updateColorPreview(key, hexColor);
                    updatePreview();
                    generateCSS();
                    saveColors();
                }
                pickr.hide();
            });
            
            // Handle live color change (as user drags)
            pickr.on('change', (color, source, instance) => {
                if (color) {
                    const hexColor = color.toHEXA().toString();
                    updateColorPreview(key, hexColor);
                }
            });
            
            // Update Pickr when color is loaded from storage
            pickr.on('init', () => {
                pickr.setColor(currentColors[key]);
            });
            
            colorPickers[key] = pickr;
        }
    });
}

// Setup color input listeners
function setupColorInputs() {
    Object.keys(defaultColors).forEach(key => {
        const input = document.getElementById(`color-${key}`);
        if (input) {
            input.addEventListener('input', (e) => {
                const color = e.target.value;
                currentColors[key] = color;
                updateColorPreview(key, color);
                updatePreview();
                generateCSS();
                saveColors();
            });
        }
    });
}

// Open color picker when clicking on preview box
function openColorPicker(element) {
    // If using Pickr
    if (colorPickers[element]) {
        colorPickers[element].setColor(currentColors[element]);
        colorPickers[element].show();
        return;
    }
    
    // Fallback to native input
    const input = document.getElementById(`color-${element}`);
    if (input) {
        // Sync the input value with the current color before opening
        if (currentColors[element]) {
            input.value = currentColors[element];
        }
        input.click();
    }
}

// Update color preview box
function updateColorPreview(element, color) {
    const preview = document.getElementById(`preview-${element}`);
    const hexDisplay = document.getElementById(`hex-${element}`);
    
    if (preview) {
        preview.style.background = color;
    }
    if (hexDisplay) {
        hexDisplay.textContent = color.toUpperCase();
    }
}

// Update live preview area
function updatePreview() {
    const previewArea = document.getElementById('preview-area');
    const primaryBtn = document.getElementById('preview-btn-primary-demo');
    const secondaryBtn = document.getElementById('preview-btn-secondary-demo');
    
    // Apply colors to preview
    if (previewArea) {
        previewArea.style.background = currentColors['card-background'];
        previewArea.style.color = currentColors.text;
        previewArea.style.borderColor = currentColors['card-border'];
        
        // Update links
        const links = previewArea.querySelectorAll('a');
        links.forEach(link => {
            link.style.color = currentColors.link;
            link.onmouseover = () => link.style.color = currentColors['link-hover'];
            link.onmouseout = () => link.style.color = currentColors.link;
        });
    }
    
    // Update buttons
    if (primaryBtn) {
        primaryBtn.style.background = currentColors['btn-primary'];
        primaryBtn.style.color = currentColors['header-text'];
        primaryBtn.onmouseover = () => primaryBtn.style.background = currentColors['btn-primary-hover'];
        primaryBtn.onmouseout = () => primaryBtn.style.background = currentColors['btn-primary'];
    }
    
    if (secondaryBtn) {
        secondaryBtn.style.background = currentColors['btn-secondary'];
        secondaryBtn.style.color = currentColors['header-text'];
        secondaryBtn.onmouseover = () => secondaryBtn.style.background = currentColors['btn-secondary-hover'];
        secondaryBtn.onmouseout = () => secondaryBtn.style.background = currentColors['btn-secondary'];
    }
}

// Generate CSS code
function generateCSS() {
    try {
        const css = `/* Custom Color Scheme - Generated by Electronic Parts Manager */

/* Root Variables */
:root {
    --background-color: ${currentColors.background};
    --text-color: ${currentColors.text};
    --header-background: ${currentColors.header};
    --header-text: ${currentColors['header-text']};
    --primary-button: ${currentColors['btn-primary']};
    --primary-button-hover: ${currentColors['btn-primary-hover']};
    --secondary-button: ${currentColors['btn-secondary']};
    --secondary-button-hover: ${currentColors['btn-secondary-hover']};
    --card-background: ${currentColors['card-background']};
    --card-border: ${currentColors['card-border']};
    --accent-color: ${currentColors.accent};
    --link-color: ${currentColors.link};
    --link-hover: ${currentColors['link-hover']};
}

/* General */
body {
    background: ${currentColors.background};
    color: ${currentColors.text};
}

/* Header */
header {
    background: ${currentColors.header};
    color: ${currentColors['header-text']};
}

header h1 {
    color: ${currentColors['header-text']};
}

/* Buttons */
.btn-primary {
    background: ${currentColors['btn-primary']};
}

.btn-primary:hover {
    background: ${currentColors['btn-primary-hover']};
}

.btn-secondary {
    background: ${currentColors['btn-secondary']};
}

.btn-secondary:hover {
    background: ${currentColors['btn-secondary-hover']};
}

/* Cards */
.card,
.stats-card,
.dashboard-card,
.style-section,
.preview-section,
.code-output {
    background: ${currentColors['card-background']};
    border-color: ${currentColors['card-border']};
}

/* Links */
a {
    color: ${currentColors.link};
}

a:hover {
    color: ${currentColors['link-hover']};
}

/* Navigation */
.main-nav a.active,
.nav-link.active {
    border-bottom-color: ${currentColors.accent};
    background: ${currentColors.accent};
}

/* Form Elements */
input:focus,
select:focus,
textarea:focus {
    border-color: ${currentColors.accent};
}

/* Tables */
thead {
    background: ${currentColors['card-background']};
    border-bottom-color: ${currentColors['card-border']};
}

tr:hover {
    background: ${currentColors.background};
}

/* Borders */
.border-accent {
    border-color: ${currentColors.accent};
}`;

        const output = document.getElementById('css-output');
        if (output) {
            // Highlight CSS syntax
            output.innerHTML = highlightCSS(css);
        } else {
            console.error('css-output element not found');
        }
    } catch (error) {
        console.error('Error generating CSS:', error);
        const output = document.getElementById('css-output');
        if (output) {
            output.textContent = 'Error generating CSS. Please refresh the page.';
        }
    }
}

// Simple CSS syntax highlighting
function highlightCSS(css) {
    // Split into lines for better control
    const lines = css.split('\n');
    const highlighted = [];
    
    for (let line of lines) {
        // Check if it's a comment line
        if (line.trim().startsWith('/*') || line.includes('/*')) {
            highlighted.push(`<span style="color: #6a9955;">${line}</span>`);
        }
        // Check if it's a selector line (ends with {)
        else if (line.trim().endsWith('{')) {
            highlighted.push(`<span style="color: #d7ba7d;">${line}</span>`);
        }
        // Check if it's a property line (contains :)
        else if (line.includes(':') && !line.trim().startsWith('}')) {
            // Split on : to highlight property and value separately
            const colonIndex = line.indexOf(':');
            const beforeColon = line.substring(0, colonIndex);
            const afterColon = line.substring(colonIndex);
            
            // Highlight hex colors in the value part
            let valueHighlighted = afterColon.replace(/(#[0-9a-fA-F]{3,6})/g, 
                '<span style="color: #ce9178;">$1</span>');
            
            highlighted.push(`<span style="color: #9cdcfe;">${beforeColon}</span>${valueHighlighted}`);
        }
        // Regular line (closing braces, etc)
        else {
            highlighted.push(line);
        }
    }
    
    return highlighted.join('\n');
}

// Copy CSS to clipboard
function copyCSS() {
    const output = document.getElementById('css-output');
    if (output) {
        // Get text content without HTML
        const text = output.innerText;
        
        navigator.clipboard.writeText(text).then(() => {
            showToast('CSS copied to clipboard!', 'success');
        }).catch(err => {
            // Fallback method
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showToast('CSS copied to clipboard!', 'success');
        });
    }
}

// Reset colors to defaults
function resetColors() {
    if (confirm('Reset all colors to defaults?')) {
        currentColors = { ...defaultColors };
        
        // Update inputs and previews
        Object.keys(currentColors).forEach(key => {
            const input = document.getElementById(`color-${key}`);
            const preview = document.getElementById(`preview-${key}`);
            if (input) input.value = currentColors[key];
            if (preview) preview.style.background = currentColors[key];
        });
        
        updatePreview();
        generateCSS();
        saveColors();
        showToast('Colors reset to defaults', 'success');
    }
}

// Download CSS file
function downloadCSS() {
    const output = document.getElementById('css-output');
    if (output) {
        const text = output.innerText;
        const blob = new Blob([text], { type: 'text/css' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'custom-styles.css';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('CSS file downloaded!', 'success');
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = message;
        toast.className = `toast toast-${type} show`;
        
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
}
