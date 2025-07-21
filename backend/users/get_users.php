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

// Get all users
$query = "SELECT id_user, user_name, user_surname, user_role, birth_date, email, phone_number, created_at FROM users ORDER BY created_at DESC";
$result = $mysqli->query($query);

if (!$result) {
    http_response_code(500);
    echo json_encode(['error' => 'Database query error']);
    exit();
}

$users = [];
while ($row = $result->fetch_assoc()) {
    $users[] = [
        'id' => $row['id_user'],
        'name' => $row['user_name'],
        'surname' => $row['user_surname'],
        'role' => $row['user_role'],
        'birth_date' => $row['birth_date'],
        'email' => $row['email'],
        'phone_number' => $row['phone_number'],
        'created_at' => $row['created_at']
    ];
}

echo json_encode(['users' => $users]);
?>
