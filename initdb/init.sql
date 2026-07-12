CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    registration_date DATETIME NOT NULL
);

INSERT IGNORE INTO users (id, name, email, registration_date) VALUES
('user-1', 'Alice Wonderland', 'alice@example.com', '2023-01-15 10:00:00'),
('user-2', 'Bob The Builder', 'bob@example.com', '2023-01-16 11:30:00'),
('user-3', 'Charlie Chaplin', 'charlie@example.com', '2023-01-17 14:00:00');
