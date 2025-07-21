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

// Get all tasks with user information
$query = "SELECT t.id_task, t.task_title, t.task_priority, t.task_progress, 
          t.task_description, t.id_user, t.created_at, t.updated_at,
          u.user_name, u.user_surname 
          FROM tasks t 
          LEFT JOIN users u ON t.id_user = u.id_user 
          ORDER BY t.created_at DESC";

$result = $mysqli->query($query);

if (!$result) {
    http_response_code(500);
    echo json_encode(['error' => 'Database query error']);
    exit();
}

$tasks = [];
while ($row = $result->fetch_assoc()) {
    $tasks[] = [
        'id' => $row['id_task'],
        'title' => $row['task_title'],
        'priority' => $row['task_priority'],
        'progress' => $row['task_progress'],
        'description' => $row['task_description'],
        'assigned_user_id' => $row['id_user'],
        'assigned_user_name' => $row['user_name'] ? $row['user_name'] . ' ' . $row['user_surname'] : null,
        'created_at' => $row['created_at'],
        'updated_at' => $row['updated_at']
    ];
}

echo json_encode(['tasks' => $tasks]);
?>
