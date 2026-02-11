const toast = document.getElementById('toast');

function convertPath() {
    const inputPath = document.getElementById('input-path').value.trim();
    
    if (!inputPath) {
        showToast('Please enter a path to convert', 'error');
        return;
    }
    
    let convertedUrl = '';
    
    // Check if it's already a URL
    if (inputPath.startsWith('http://') || inputPath.startsWith('https://') || inputPath.startsWith('file://')) {
        convertedUrl = inputPath;
    }
    // Windows UNC path (\\server\share)
    else if (inputPath.startsWith('\\\\')) {
        convertedUrl = 'file:////' + inputPath.substring(2).replace(/\\/g, '/');
    }
    // Windows absolute path (C:\...)
    else if (/^[A-Za-z]:/.test(inputPath)) {
        convertedUrl = 'file:///' + inputPath.replace(/\\/g, '/');
    }
    // Unix/Mac absolute path (/home/...)
    else if (inputPath.startsWith('/')) {
        convertedUrl = 'file://' + inputPath;
    }
    // Relative path
    else {
        showToast('Please provide an absolute path (e.g., C:\\... or /home/...)', 'error');
        return;
    }
    
    // Display result
    document.getElementById('output-url').value = convertedUrl;
    document.getElementById('test-link').href = convertedUrl;
    document.getElementById('result-section').style.display = 'block';
    
    showToast('Path converted successfully!', 'success');
}

function clearConverter() {
    document.getElementById('input-path').value = '';
    document.getElementById('output-url').value = '';
    document.getElementById('result-section').style.display = 'none';
}

function copyToClipboard() {
    const output = document.getElementById('output-url');
    output.select();
    output.setSelectionRange(0, 99999); // For mobile devices
    
    try {
        navigator.clipboard.writeText(output.value).then(() => {
            showToast('URL copied to clipboard!', 'success');
        }).catch(() => {
            // Fallback for older browsers
            document.execCommand('copy');
            showToast('URL copied to clipboard!', 'success');
        });
    } catch (err) {
        showToast('Failed to copy. Please select and copy manually.', 'error');
    }
}

function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
