<?php
require_once '../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['email']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Email and password required']);
    exit();
}

$email = $data['email'];
$password = $data['password'];

// Prepare and execute query using mysqli
$stmt = $mysqli->prepare("SELECT id_user, user_name, user_surname, user_role, password FROM users WHERE email = ?");
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['error' => 'Database prepare error']);
    exit();
}

$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if (!$user || !password_verify($password, $user['password'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid credentials']);
    exit();
}

// Set session variables
$_SESSION['user_id'] = $user['id_user'];
$_SESSION['user_name'] = $user['user_name'];
$_SESSION['user_surname'] = $user['user_surname'];
$_SESSION['user_role'] = $user['user_role'];

echo json_encode([
    'success' => true,
    'user' => [
        'id' => $user['id_user'],
        'name' => $user['user_name'],
        'surname' => $user['user_surname'],
        'role' => $user['user_role']
    ]
]);

$stmt->close();
?>
