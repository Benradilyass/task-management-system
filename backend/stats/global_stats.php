<?php
require_once '../config/db.php';

// Check if user is authenticated and is admin
if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Access denied. Admin privileges required.']);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Get global task statistics
$task_stats_query = "SELECT 
    COUNT(*) as total_tasks,
    SUM(CASE WHEN task_progress = 'Pending' THEN 1 ELSE 0 END) as pending_tasks,
    SUM(CASE WHEN task_progress = 'In Progress' THEN 1 ELSE 0 END) as in_progress_tasks,
    SUM(CASE WHEN task_progress = 'Needs Review' THEN 1 ELSE 0 END) as needs_review_tasks,
    SUM(CASE WHEN task_progress = 'In Review' THEN 1 ELSE 0 END) as in_review_tasks,
    SUM(CASE WHEN task_progress = 'Needs Validation' THEN 1 ELSE 0 END) as needs_validation_tasks,
    SUM(CASE WHEN task_progress = 'Done' THEN 1 ELSE 0 END) as completed_tasks,
    SUM(CASE WHEN task_priority = 'High' THEN 1 ELSE 0 END) as high_priority_tasks,
    SUM(CASE WHEN task_priority = 'Medium' THEN 1 ELSE 0 END) as medium_priority_tasks,
    SUM(CASE WHEN task_priority = 'Low' THEN 1 ELSE 0 END) as low_priority_tasks,
    SUM(CASE WHEN id_user IS NULL THEN 1 ELSE 0 END) as unassigned_tasks
    FROM tasks";

$result = $mysqli->query($task_stats_query);
if (!$result) {
    http_response_code(500);
    echo json_encode(['error' => 'Database query error']);
    exit();
}

$task_stats = $result->fetch_assoc();

// Get user statistics
$user_stats_query = "SELECT 
    COUNT(*) as total_users,
    SUM(CASE WHEN user_role = 'admin' THEN 1 ELSE 0 END) as admin_users,
    SUM(CASE WHEN user_role = 'user' THEN 1 ELSE 0 END) as normal_users
    FROM users";

$user_result = $mysqli->query($user_stats_query);
if (!$user_result) {
    http_response_code(500);
    echo json_encode(['error' => 'Database query error']);
    exit();
}

$user_stats = $user_result->fetch_assoc();

// Get per-user task counts
$per_user_query = "SELECT 
    u.id_user,
    u.user_name,
    u.user_surname,
    u.email,
    COUNT(t.id_task) as task_count,
    SUM(CASE WHEN t.task_progress = 'Done' THEN 1 ELSE 0 END) as completed_count
    FROM users u
    LEFT JOIN tasks t ON u.id_user = t.id_user
    WHERE u.user_role = 'user'
    GROUP BY u.id_user, u.user_name, u.user_surname, u.email
    ORDER BY task_count DESC";

$per_user_result = $mysqli->query($per_user_query);
if (!$per_user_result) {
    http_response_code(500);
    echo json_encode(['error' => 'Database query error']);
    exit();
}

$per_user_stats = [];
while ($row = $per_user_result->fetch_assoc()) {
    $per_user_stats[] = [
        'user_id' => $row['id_user'],
        'name' => $row['user_name'] . ' ' . $row['user_surname'],
        'email' => $row['email'],
        'total_tasks' => (int)$row['task_count'],
        'completed_tasks' => (int)$row['completed_count']
    ];
}

echo json_encode([
    'task_stats' => [
        'total_tasks' => (int)$task_stats['total_tasks'],
        'pending_tasks' => (int)$task_stats['pending_tasks'],
        'in_progress_tasks' => (int)$task_stats['in_progress_tasks'],
        'needs_review_tasks' => (int)$task_stats['needs_review_tasks'],
        'in_review_tasks' => (int)$task_stats['in_review_tasks'],
        'needs_validation_tasks' => (int)$task_stats['needs_validation_tasks'],
        'completed_tasks' => (int)$task_stats['completed_tasks'],
        'high_priority_tasks' => (int)$task_stats['high_priority_tasks'],
        'medium_priority_tasks' => (int)$task_stats['medium_priority_tasks'],
        'low_priority_tasks' => (int)$task_stats['low_priority_tasks'],
        'unassigned_tasks' => (int)$task_stats['unassigned_tasks']
    ],
    'user_stats' => [
        'total_users' => (int)$user_stats['total_users'],
        'admin_users' => (int)$user_stats['admin_users'],
        'normal_users' => (int)$user_stats['normal_users']
    ],
    'per_user_stats' => $per_user_stats
]);
?>
