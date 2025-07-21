<?php
require_once '../config/db.php';

// Check if user is authenticated and is admin
if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Access denied. Admin privileges required.']);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['title']) || !isset($data['priority']) || !isset($data['description'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Title, priority, and description are required']);
    exit();
}

$title = $data['title'];
$priority = $data['priority'];
$description = $data['description'];
$assigned_user_id = isset($data['assigned_user_id']) ? $data['assigned_user_id'] : null;

// Validate priority
$valid_priorities = ['High', 'Medium', 'Low'];
if (!in_array($priority, $valid_priorities)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid priority. Must be High, Medium, or Low']);
    exit();
}

// Prepare and execute insert query
$stmt = $mysqli->prepare("INSERT INTO tasks (task_title, task_priority, task_progress, task_description, id_user) VALUES (?, ?, 'Pending', ?, ?)");
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['error' => 'Database prepare error']);
    exit();
}

$stmt->bind_param("sssi", $title, $priority, $description, $assigned_user_id);

if ($stmt->execute()) {
    $task_id = $mysqli->insert_id;
    echo json_encode([
        'success' => true,
        'message' => 'Task created successfully',
        'task_id' => $task_id
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to create task']);
}

$stmt->close();
?>
