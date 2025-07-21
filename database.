-- Task Management System Database Schema
-- MySQL Database for Task Management System

CREATE DATABASE IF NOT EXISTS task_management;
USE task_management;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id_user INT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(20) NOT NULL,
    user_surname VARCHAR(20) NOT NULL,
    user_role VARCHAR(20) NOT NULL CHECK (user_role IN ('admin', 'user')),
    birth_date DATE,
    email VARCHAR(30) UNIQUE NOT NULL,
    phone_number BIGINT,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id_task INT AUTO_INCREMENT PRIMARY KEY,
    task_title VARCHAR(40) NOT NULL,
    task_priority VARCHAR(10) NOT NULL CHECK (task_priority IN ('High', 'Medium', 'Low')),
    task_progress VARCHAR(20) NOT NULL CHECK (task_progress IN ('Pending', 'In Progress', 'Needs Review', 'In Review', 'Needs Validation', 'Done')),
    task_description TEXT,
    id_user INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE SET NULL
);

-- Insert seed data
-- Admin user (password: Admin123!)
INSERT INTO users (user_name, user_surname, user_role, birth_date, email, phone_number, password) 
VALUES ('Admin', 'User', 'admin', '1990-01-01', 'admin@example.com', 1234567890, '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- Normal user (password: User123!)
INSERT INTO users (user_name, user_surname, user_role, birth_date, email, phone_number, password) 
VALUES ('John', 'Doe', 'user', '1995-05-15', 'john@example.com', 9876543210, '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- Sample tasks
INSERT INTO tasks (task_title, task_priority, task_progress, task_description, id_user) 
VALUES 
('Setup project environment', 'High', 'Done', 'Initialize the development environment', 1),
('Design database schema', 'High', 'Done', 'Create MySQL database structure', 1),
('Implement user authentication', 'Medium', 'In Progress', 'Build login/logout functionality', 1),
('Create task management API', 'Medium', 'Pending', 'Develop PHP endpoints for CRUD operations', NULL),
('Build React frontend', 'Low', 'Pending', 'Create user interface components', NULL);
