<?php
// backend/config/db.php

class ENV {
    private static bool $loaded = false;
    public static function load(string $path) {
        if (!self::$loaded && file_exists($path)) {
            $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                if (strpos(trim($line), '#') === 0) continue;
                list($name, $value) = explode('=', $line, 2) + [NULL, NULL];
                if ($name !== null && $value !== null) {
                    $name = trim($name);
                    $value = trim($value);
                    $_ENV[$name] = $value;
                }
            }
            self::$loaded = true;
        }
    }
}

// Try to load .env manually if running strictly on a minimal LAMP setup
ENV::load(__DIR__ . '/../.env');

class DB {
    private static ?PDO $instance = null;

    public static function getConnection(): PDO {
        if (self::$instance === null) {
            $host = getenv('DB_HOST') ?: $_ENV['DB_HOST'] ?? '127.0.0.1';
            $db   = getenv('DB_NAME') ?: $_ENV['DB_NAME'] ?? 'mockdrop';
            $user = getenv('DB_USER') ?: $_ENV['DB_USER'] ?? 'root';
            $pass = getenv('DB_PASS') ?: $_ENV['DB_PASS'] ?? '';
            $charset = 'utf8mb4';

            $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];
            
            try {
                self::$instance = new PDO($dsn, $user, $pass, $options);
            } catch (\PDOException $e) {
                header('Content-Type: application/json; charset=UTF-8');
                http_response_code(500);
                echo json_encode(["success" => false, "error" => "Database connection failed"]);
                exit;
            }
        }
        return self::$instance;
    }
}
