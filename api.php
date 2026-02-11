<?php
// Start output buffering to catch any stray output
ob_start();

header('Content-Type: application/json');
require_once 'config.php';

$conn = getDBConnection();

// Get request method and action
$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

// Response array
$response = ['success' => false, 'message' => ''];

switch ($method) {
    case 'GET':
        if ($action === 'all') {
            // Get all parts with category names
            $sql = "SELECT p.*, c.name as category_name 
                    FROM parts p 
                    LEFT JOIN categories c ON p.category_id = c.id 
                    ORDER BY p.id DESC";
            $result = $conn->query($sql);
            
            $parts = [];
            if ($result->num_rows > 0) {
                while ($row = $result->fetch_assoc()) {
                    $parts[] = $row;
                }
            }
            
            $response['success'] = true;
            $response['data'] = $parts;
        } elseif ($action === 'single' && isset($_GET['id'])) {
            // Get single part
            $id = intval($_GET['id']);
            
            // Check if subcategory_id column exists
            $checkColumn = $conn->query("SHOW COLUMNS FROM parts LIKE 'subcategory_id'");
            $hasSubcategory = $checkColumn->num_rows > 0;
            
            if ($hasSubcategory) {
                $sql = "SELECT p.*, c.name as category_name, sc.name as subcategory_name
                        FROM parts p 
                        LEFT JOIN categories c ON p.category_id = c.id 
                        LEFT JOIN categories sc ON p.subcategory_id = sc.id
                        WHERE p.id = ?";
            } else {
                $sql = "SELECT p.*, c.name as category_name
                        FROM parts p 
                        LEFT JOIN categories c ON p.category_id = c.id 
                        WHERE p.id = ?";
            }
            
            $stmt = $conn->prepare($sql);
            $stmt->bind_param('i', $id);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows > 0) {
                $response['success'] = true;
                $response['data'] = $result->fetch_assoc();
            } else {
                $response['message'] = 'Part not found';
            }
        } elseif ($action === 'categories') {
            // Get all categories with parent info
            $sql = "SELECT c.*, p.name as parent_name 
                    FROM categories c 
                    LEFT JOIN categories p ON c.parent_id = p.id 
                    ORDER BY COALESCE(c.parent_id, c.id), c.name ASC";
            $result = $conn->query($sql);
            
            $categories = [];
            if ($result->num_rows > 0) {
                while ($row = $result->fetch_assoc()) {
                    $categories[] = $row;
                }
            }
            
            $response['success'] = true;
            $response['data'] = $categories;
        } elseif ($action === 'categories_tree') {
            // Get categories in hierarchical tree structure
            $sql = "SELECT * FROM categories ORDER BY name ASC";
            $result = $conn->query($sql);
            
            $allCategories = [];
            if ($result->num_rows > 0) {
                while ($row = $result->fetch_assoc()) {
                    $allCategories[] = $row;
                }
            }
            
            // Build tree structure
            $tree = [];
            $lookup = [];
            
            // First pass: create lookup and initialize children arrays
            foreach ($allCategories as $category) {
                $category['children'] = [];
                $lookup[$category['id']] = $category;
            }
            
            // Second pass: build tree
            foreach ($lookup as $id => $category) {
                if ($category['parent_id'] === null) {
                    $tree[] = &$lookup[$id];
                } else if (isset($lookup[$category['parent_id']])) {
                    $lookup[$category['parent_id']]['children'][] = &$lookup[$id];
                }
            }
            
            $response['success'] = true;
            $response['data'] = $tree;
        } elseif ($action === 'subcategories' && isset($_GET['parent_id'])) {
            // Get subcategories for a specific parent
            $parent_id = intval($_GET['parent_id']);
            $sql = "SELECT * FROM categories WHERE parent_id = ? ORDER BY name ASC";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param('i', $parent_id);
            $stmt->execute();
            $result = $stmt->get_result();
            
            $subcategories = [];
            if ($result->num_rows > 0) {
                while ($row = $result->fetch_assoc()) {
                    $subcategories[] = $row;
                }
            }
            
            $response['success'] = true;
            $response['data'] = $subcategories;
        } elseif ($action === 'category_single' && isset($_GET['id'])) {
            // Get single category
            $id = intval($_GET['id']);
            $sql = "SELECT * FROM categories WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param('i', $id);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows > 0) {
                $response['success'] = true;
                $response['data'] = $result->fetch_assoc();
            } else {
                $response['message'] = 'Category not found';
            }
        } elseif ($action === 'config') {
            // Get all configuration settings
            $sql = "SELECT * FROM config ORDER BY config_key ASC";
            $result = $conn->query($sql);
            
            $config = [];
            if ($result->num_rows > 0) {
                while ($row = $result->fetch_assoc()) {
                    $config[$row['config_key']] = $row['config_value'];
                }
            }
            
            $response['success'] = true;
            $response['data'] = $config;
        } elseif ($action === 'config_all') {
            // Get all configuration settings with details
            $sql = "SELECT * FROM config ORDER BY config_key ASC";
            $result = $conn->query($sql);
            
            $configs = [];
            if ($result->num_rows > 0) {
                while ($row = $result->fetch_assoc()) {
                    $configs[] = $row;
                }
            }
            
            $response['success'] = true;
            $response['data'] = $configs;
        }
        break;
        
    case 'POST':
        if ($action === 'create') {
            // Create new part
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (empty($data['name']) || empty($data['category_id'])) {
                $response['message'] = 'Name and Category are required';
            } else {
                $sql = "INSERT INTO parts (name, category_id, quantity, value, size, thumbnail, link, project_folder_link, code_folder_link, freecad_folder_link, youtube_link, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                $stmt = $conn->prepare($sql);
                $quantity = isset($data['quantity']) ? intval($data['quantity']) : 0;
                $value = isset($data['value']) ? $data['value'] : '';
                $size = isset($data['size']) ? $data['size'] : '';
                $thumbnail = isset($data['thumbnail']) ? $data['thumbnail'] : '';
                $stmt->bind_param('siisssssssss', 
                    $data['name'], 
                    $data['category_id'],
                    $quantity,
                    $value,
                    $size,
                    $thumbnail,
                    $data['link'], 
                    $data['project_folder_link'],
                    $data['code_folder_link'],
                    $data['freecad_folder_link'],
                    $data['youtube_link'],
                    $data['description']
                );
                
                if ($stmt->execute()) {
                    $response['success'] = true;
                    $response['message'] = 'Part created successfully';
                    $response['id'] = $conn->insert_id;
                } else {
                    $response['message'] = 'Error creating part: ' . $stmt->error;
                }
            }
        } elseif ($action === 'create_category') {
            // Create new category
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (empty($data['name'])) {
                $response['message'] = 'Category name is required';
            } else {
                $parent_id = isset($data['parent_id']) && $data['parent_id'] !== '' ? intval($data['parent_id']) : null;
                
                $sql = "INSERT INTO categories (name, parent_id, description) VALUES (?, ?, ?)";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param('sis', 
                    $data['name'],
                    $parent_id,
                    $data['description']
                );
                
                if ($stmt->execute()) {
                    $response['success'] = true;
                    $response['message'] = 'Category created successfully';
                    $response['id'] = $conn->insert_id;
                } else {
                    if ($conn->errno == 1062) { // Duplicate entry
                        $response['message'] = 'Category already exists';
                    } else {
                        $response['message'] = 'Error creating category: ' . $stmt->error;
                    }
                }
            }
        }
        break;
        
    case 'PUT':
        if ($action === 'update') {
            // Update part
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (empty($data['id']) || empty($data['name']) || empty($data['category_id'])) {
                $response['message'] = 'ID, Name and Category are required';
            } else {
                $sql = "UPDATE parts SET name = ?, category_id = ?, quantity = ?, value = ?, size = ?, thumbnail = ?, link = ?, project_folder_link = ?, code_folder_link = ?, freecad_folder_link = ?, youtube_link = ?, description = ? WHERE id = ?";
                $stmt = $conn->prepare($sql);
                $quantity = isset($data['quantity']) ? intval($data['quantity']) : 0;
                $value = isset($data['value']) ? $data['value'] : '';
                $size = isset($data['size']) ? $data['size'] : '';
                $thumbnail = isset($data['thumbnail']) ? $data['thumbnail'] : '';
                $stmt->bind_param('siisssssssssi', 
                    $data['name'], 
                    $data['category_id'],
                    $quantity,
                    $value,
                    $size,
                    $thumbnail,
                    $data['link'], 
                    $data['project_folder_link'],
                    $data['code_folder_link'],
                    $data['freecad_folder_link'],
                    $data['youtube_link'],
                    $data['description'],
                    $data['id']
                );
                
                if ($stmt->execute()) {
                    $response['success'] = true;
                    $response['message'] = 'Part updated successfully';
                } else {
                    $response['message'] = 'Error updating part: ' . $stmt->error;
                }
            }
        } elseif ($action === 'move_part') {
            // Move part to different category (partial update)
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (empty($data['id']) || empty($data['category_id'])) {
                $response['message'] = 'Part ID and Category ID are required';
            } else {
                $sql = "UPDATE parts SET category_id = ? WHERE id = ?";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param('ii', 
                    $data['category_id'],
                    $data['id']
                );
                
                if ($stmt->execute()) {
                    $response['success'] = true;
                    $response['message'] = 'Part moved successfully';
                } else {
                    $response['message'] = 'Error moving part: ' . $stmt->error;
                }
            }
        } elseif ($action === 'update_category') {
            // Update category
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (empty($data['id']) || empty($data['name'])) {
                $response['message'] = 'ID and Name are required';
            } else {
                $parent_id = isset($data['parent_id']) && $data['parent_id'] !== '' ? intval($data['parent_id']) : null;
                
                // Check for circular reference (category can't be its own parent)
                if ($parent_id == $data['id']) {
                    $response['message'] = 'Category cannot be its own parent';
                } else {
                    $sql = "UPDATE categories SET name = ?, parent_id = ?, description = ? WHERE id = ?";
                    $stmt = $conn->prepare($sql);
                    $stmt->bind_param('sisi', 
                        $data['name'],
                        $parent_id,
                        $data['description'],
                        $data['id']
                    );
                    
                    if ($stmt->execute()) {
                        $response['success'] = true;
                        $response['message'] = 'Category updated successfully';
                    } else {
                        if ($conn->errno == 1062) { // Duplicate entry
                            $response['message'] = 'Category name already exists';
                        } else {
                            $response['message'] = 'Error updating category: ' . $stmt->error;
                        }
                    }
                }
            }
        } elseif ($action === 'update_config') {
            // Update configuration settings
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (empty($data['config_key']) || !isset($data['config_value'])) {
                $response['message'] = 'Config key and value are required';
            } else {
                $sql = "UPDATE config SET config_value = ? WHERE config_key = ?";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param('ss', 
                    $data['config_value'],
                    $data['config_key']
                );
                
                if ($stmt->execute()) {
                    $response['success'] = true;
                    $response['message'] = 'Configuration updated successfully';
                } else {
                    $response['message'] = 'Error updating configuration: ' . $stmt->error;
                }
            }
        }
        break;
        
    case 'DELETE':
        if ($action === 'delete' && isset($_GET['id'])) {
            // Delete part
            $id = intval($_GET['id']);
            $sql = "DELETE FROM parts WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param('i', $id);
            
            if ($stmt->execute()) {
                $response['success'] = true;
                $response['message'] = 'Part deleted successfully';
            } else {
                $response['message'] = 'Error deleting part: ' . $stmt->error;
            }
        } elseif ($action === 'delete_category' && isset($_GET['id'])) {
            // Delete category (only if no parts use it)
            $id = intval($_GET['id']);
            
            // Check if category is in use
            $checkSql = "SELECT COUNT(*) as count FROM parts WHERE category_id = ?";
            $checkStmt = $conn->prepare($checkSql);
            $checkStmt->bind_param('i', $id);
            $checkStmt->execute();
            $checkResult = $checkStmt->get_result();
            $count = $checkResult->fetch_assoc()['count'];
            
            if ($count > 0) {
                $response['message'] = "Cannot delete category. It is used by $count part(s).";
            } else {
                $sql = "DELETE FROM categories WHERE id = ?";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param('i', $id);
                
                if ($stmt->execute()) {
                    $response['success'] = true;
                    $response['message'] = 'Category deleted successfully';
                } else {
                    $response['message'] = 'Error deleting category: ' . $stmt->error;
                }
            }
        }
        break;
        
    default:
        $response['message'] = 'Invalid request method';
}

$conn->close();

// Clear any stray output and send clean JSON
ob_clean();
echo json_encode($response);
ob_end_flush();
