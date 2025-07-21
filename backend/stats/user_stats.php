<?php
require_once '../config/db.php';

// Check if user is authenticated
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$user_id = $_SESSION['user_id'];
$user_role = $_SESSION['user_role'];

// If admin requests stats for specific user
if ($user_role === 'admin' && isset($_GET['user_id'])) {
    $user_id = $_GET['user_id'];
}

// Get user task statistics
$stats_query = "SELECT 
    COUNT(*) as total_tasks,
    SUM(CASE WHEN task_progress = 'Pending' THEN 1 ELSE 0 END) as pending_tasks,
    SUM(CASE WHEN task_progress = 'In Progress' THEN 1 ELSE 0 END) as in_progress_tasks,
    SUM(CASE WHEN task_progress = 'Needs Review' THEN 1 ELSE 0 END) as needs_review_tasks,
    SUM(CASE WHEN task_progress = 'In Review' THEN 1 ELSE 0 END) as in_review_tasks,
    SUM(CASE WHEN task_progress = 'Needs Validation' THEN 1 ELSE 0 END) as needs_validation_tasks,
    SUM(CASE WHEN task_progress = 'Done' THEN 1 ELSE 0 END) as completed_tasks,
    SUM(CASE WHEN task_priority = 'High' THEN 1 ELSE 0 END) as high_priority_tasks,
    SUM(CASE WHEN task_priority = 'Medium' THEN 1 ELSE 0 END) as medium_priority_tasks,
    SUM(CASE WHEN task_priority = 'Low' THEN 1 ELSE 0 END) as low_priority_tasks
    FROM tasks 
    WHERE id_user = ?";

$stmt = $mysqli->prepare($stats_query);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['error' => 'Database prepare error']);
    exit();
}

$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$stats = $result->fetch_assoc();
$stmt->close();

// Get user information
$user_query = "SELECT user_name, user_surname, email FROM users WHERE id_user = ?";
$user_stmt = $mysqli->prepare($user_query);
if (!$user_stmt) {
    http_response_code(500);
    echo json_encode(['error' => 'Database prepare error']);
    exit();
}

$user_stmt->bind_param("i", $user_id);
$user_stmt->execute();
$user_result = $user_stmt->get_result();
$user_info = $user_result->fetch_assoc();
$user_stmt->close();

if (!$user_info) {
    http_response_code(404);
    echo json_encode(['error' => 'User not found']);
    exit();
}

echo json_encode([
    'user_info' => [
        'name' => $user_info['user_name'] . ' ' . $user_info['user_surname'],
        'email' => $user_info['email']
    ],
    'task_stats' => [
        'total_tasks' => (int)$stats['total_tasks'],
        'pending_tasks' => (int)$stats['pending_tasks'],
        'in_progress_tasks' => (int)$stats['in_progress_tasks'],
        'needs_review_tasks' => (int)$stats['needs_review_tasks'],
        'in_review_tasks' => (int)$stats['in_review_tasks'],
        'needs_validation_tasks' => (int)$stats['needs_validation_tasks'],
        'completed_tasks' => (int)$stats['completed_tasks'],
        'high_priority_tasks' => (int)$stats['high_priority_tasks'],
        'medium_priority_tasks' => (int)$stats['medium_priority_tasks'],
        'low_priority_tasks' => (int)$stats['low_priority_tasks']
    ]
]);
?>
