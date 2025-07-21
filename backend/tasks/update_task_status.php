<?php
require_once '../config/db.php';

// Check if user is authenticated
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['task_id']) || !isset($data['new_status'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Task ID and new status are required']);
    exit();
}

$task_id = $data['task_id'];
$new_status = $data['new_status'];
$user_id = $_SESSION['user_id'];
$user_role = $_SESSION['user_role'];

// Valid status transitions
$valid_statuses = ['Pending', 'In Progress', 'Needs Review', 'In Review', 'Needs Validation', 'Done'];
if (!in_array($new_status, $valid_statuses)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid status']);
    exit();
}

// Get current task details
$stmt = $mysqli->prepare("SELECT task_progress, id_user FROM tasks WHERE id_task = ?");
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['error' => 'Database prepare error']);
    exit();
}

$stmt->bind_param("i", $task_id);
$stmt->execute();
$result = $stmt->get_result();
$task = $result->fetch_assoc();
$stmt->close();

if (!$task) {
    http_response_code(404);
    echo json_encode(['error' => 'Task not found']);
    exit();
}

$current_status = $task['task_progress'];
$assigned_user_id = $task['id_user'];

// Status transition logic
$status_flow = [
    'Pending' => ['In Progress'],
    'In Progress' => ['Needs Review'],
    'Needs Review' => ['In Review'],
    'In Review' => ['Needs Validation'],
    'Needs Validation' => ['Done'],
    'Done' => []
];

// For normal users, check permissions and workflow
if ($user_role !== 'admin') {
    // User can only take ownership of pending tasks or update tasks assigned to them
    if ($current_status === 'Pending' && $new_status === 'In Progress') {
        // Taking ownership - assign task to user
        $assigned_user_id = $user_id;
    } else {
        // Check if user is assigned to this task
        if ($assigned_user_id != $user_id) {
            http_response_code(403);
            echo json_encode(['error' => 'You can only update tasks assigned to you']);
            exit();
        }
        
        // Check if status transition is valid
        if (!in_array($new_status, $status_flow[$current_status])) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid status transition']);
            exit();
        }
    }
}

// Update task status and assigned user
$update_stmt = $mysqli->prepare("UPDATE tasks SET task_progress = ?, id_user = ?, updated_at = CURRENT_TIMESTAMP WHERE id_task = ?");
if (!$update_stmt) {
    http_response_code(500);
    echo json_encode(['error' => 'Database prepare error']);
    exit();
}

$update_stmt->bind_param("sii", $new_status, $assigned_user_id, $task_id);

if ($update_stmt->execute()) {
    echo json_encode([
        'success' => true,
        'message' => 'Task status updated successfully'
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to update task status']);
}

$update_stmt->close();
?>
