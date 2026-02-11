<?php
// Start output buffering to prevent any output before JSON
ob_start();

header('Content-Type: application/json');

// Disable error display, log instead
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Create uploads directory if it doesn't exist
$uploadDir = __DIR__ . '/uploads/';
if (!file_exists($uploadDir)) {
    if (!mkdir($uploadDir, 0755, true)) {
        ob_end_clean();
        echo json_encode(['success' => false, 'message' => 'Failed to create uploads directory']);
        exit;
    }
}

$response = ['success' => false, 'message' => '', 'filename' => ''];

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['thumbnail'])) {
    $file = $_FILES['thumbnail'];
    
    // Check for upload errors
    if ($file['error'] !== UPLOAD_ERR_OK) {
        $response['message'] = 'Upload error code: ' . $file['error'];
        ob_end_clean();
        echo json_encode($response);
        exit;
    }
    
    // Check if file was actually uploaded
    if (!is_uploaded_file($file['tmp_name'])) {
        $response['message'] = 'File upload validation failed';
        ob_end_clean();
        echo json_encode($response);
        exit;
    }
    
    // Validate file type
    $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    
    // Try to get mime type
    $fileType = '';
    if (function_exists('mime_content_type')) {
        $fileType = mime_content_type($file['tmp_name']);
    } elseif (function_exists('finfo_open')) {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $fileType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);
    } else {
        // Fallback to extension check
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $extensionMap = [
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif'
        ];
        $fileType = isset($extensionMap[$extension]) ? $extensionMap[$extension] : '';
    }
    
    if (!in_array($fileType, $allowedTypes)) {
        $response['message'] = 'Invalid file type. Only JPG, PNG, and GIF images are allowed.';
        ob_end_clean();
        echo json_encode($response);
        exit;
    }
    
    // Validate file size (max 250KB)
    $maxSize = 250 * 1024; // 250KB
    if ($file['size'] > $maxSize) {
        $response['message'] = 'File too large. Maximum size is 250KB.';
        ob_end_clean();
        echo json_encode($response);
        exit;
    }
    
    // Generate unique filename
    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $filename = uniqid('thumb_', true) . '.' . $extension;
    $filepath = $uploadDir . $filename;
    $thumbFilepath = $uploadDir . 'thumb_' . $filename;
    
    // Move uploaded file
    if (move_uploaded_file($file['tmp_name'], $filepath)) {
        // Create thumbnail (48x48) as separate file
        if (createThumbnail($filepath, $thumbFilepath, 48, 48)) {
            $response['success'] = true;
            $response['message'] = 'Image uploaded successfully';
            $response['filename'] = $filename;
        } else {
            $response['message'] = 'Image uploaded but thumbnail creation failed';
            // Still return success with filename
            $response['success'] = true;
            $response['filename'] = $filename;
        }
    } else {
        $response['message'] = 'Failed to save uploaded file';
    }
} else {
    $response['message'] = 'No file uploaded';
}

ob_end_clean();
echo json_encode($response);
exit;

// Function to create thumbnail
function createThumbnail($source, $destination, $width, $height) {
    if (!function_exists('imagecreatefromjpeg')) {
        return false; // GD library not available
    }
    
    $imageInfo = @getimagesize($source);
    if (!$imageInfo) {
        return false;
    }
    
    $mime = $imageInfo['mime'];
    
    // Create image resource based on mime type
    $sourceImage = false;
    switch ($mime) {
        case 'image/jpeg':
        case 'image/jpg':
            $sourceImage = @imagecreatefromjpeg($source);
            break;
        case 'image/png':
            $sourceImage = @imagecreatefrompng($source);
            break;
        case 'image/gif':
            $sourceImage = @imagecreatefromgif($source);
            break;
    }
    
    if (!$sourceImage) {
        return false;
    }
    
    // Get original dimensions
    $origWidth = imagesx($sourceImage);
    $origHeight = imagesy($sourceImage);
    
    // Calculate aspect ratio
    $aspectRatio = $origWidth / $origHeight;
    
    // Calculate new dimensions maintaining aspect ratio
    if ($width / $height > $aspectRatio) {
        $newWidth = $height * $aspectRatio;
        $newHeight = $height;
    } else {
        $newHeight = $width / $aspectRatio;
        $newWidth = $width;
    }
    
    // Create thumbnail
    $thumbnail = imagecreatetruecolor($width, $height);
    if (!$thumbnail) {
        imagedestroy($sourceImage);
        return false;
    }
    
    // Preserve transparency for PNG and GIF
    if ($mime == 'image/png' || $mime == 'image/gif') {
        imagealphablending($thumbnail, false);
        imagesavealpha($thumbnail, true);
        $transparent = imagecolorallocatealpha($thumbnail, 255, 255, 255, 127);
        imagefilledrectangle($thumbnail, 0, 0, $width, $height, $transparent);
    }
    
    // Calculate position to center the image
    $x = ($width - $newWidth) / 2;
    $y = ($height - $newHeight) / 2;
    
    // Resize and position
    imagecopyresampled($thumbnail, $sourceImage, $x, $y, 0, 0, $newWidth, $newHeight, $origWidth, $origHeight);
    
    // Save thumbnail based on mime type
    $saved = false;
    switch ($mime) {
        case 'image/jpeg':
        case 'image/jpg':
            $saved = @imagejpeg($thumbnail, $destination, 90);
            break;
        case 'image/png':
            $saved = @imagepng($thumbnail, $destination, 9);
            break;
        case 'image/gif':
            $saved = @imagegif($thumbnail, $destination);
            break;
    }
    
    // Free memory
    imagedestroy($sourceImage);
    imagedestroy($thumbnail);
    
    return $saved;
}
?>
