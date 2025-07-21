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

// Validate required fields
$required_fields = ['name', 'surname', 'role', 'email', 'password'];
foreach ($required_fields as $field) {
    if (!isset($data[$field]) || empty($data[$field])) {
        http_response_code(400);
        echo json_encode(['error' => ucfirst($field) . ' is required']);
        exit();
    }
}

$name = $data['name'];
$surname = $data['surname'];
$role = $data['role'];
$birth_date = isset($data['birth_date']) ? $data['birth_date'] : null;
$email = $data['email'];
$phone_number = isset($data['phone_number']) ? $data['phone_number'] : null;
$password = $data['password'];

// Validate role
$valid_roles = ['admin', 'user'];
if (!in_array($role, $valid_roles)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid role. Must be admin or user']);
    exit();
}

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email format']);
    exit();
}

// Check if email already exists
$check_stmt = $mysqli->prepare("SELECT id_user FROM users WHERE email = ?");
if (!$check_stmt) {
    http_response_code(500);
    echo json_encode(['error' => 'Database prepare error']);
    exit();
}

$check_stmt->bind_param("s", $email);
$check_stmt->execute();
$result = $check_stmt->get_result();

if ($result->num_rows > 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Email already exists']);
    exit();
}
$check_stmt->close();

// Hash password
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

// Insert new user
$stmt = $mysqli->prepare("INSERT INTO users (user_name, user_surname, user_role, birth_date, email, phone_number, password) VALUES (?, ?, ?, ?, ?, ?, ?)");
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['error' => 'Database prepare error']);
    exit();
}

$stmt->bind_param("sssssss", $name, $surname, $role, $birth_date, $email, $phone_number, $hashed_password);

if ($stmt->execute()) {
    $user_id = $mysqli->insert_id;
    echo json_encode([
        'success' => true,
        'message' => 'User created successfully',
        'user_id' => $user_id
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to create user']);
}

$stmt->close();
?>
