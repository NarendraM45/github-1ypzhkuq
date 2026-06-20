<?php
// backend/api/delete.php
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Secret-Token');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(["success" => false, "error" => "Method not allowed"]);
    exit;
}

require_once __DIR__ . '/../config/db.php';

try {
    $hash = $_GET['hash'] ?? '';
    if (!$hash || !preg_match('/^[a-f0-9]{10}$/i', $hash)) {
        http_response_code(404);
        echo json_encode(["success" => false, "error" => "Not Found"]);
        exit;
    }

    $secretKey = getenv('SECRET_KEY') ?: $_ENV['SECRET_KEY'] ?? '';
    
    $providedToken = $_SERVER['HTTP_X_SECRET_TOKEN'] ?? '';
    
    // We do a strict comparison on the secret token
    if (empty($secretKey) || empty($providedToken) || !hash_equals($secretKey, $providedToken)) {
        http_response_code(403);
        echo json_encode(["success" => false, "error" => "Forbidden - Invalid Secret Token"]);
        exit;
    }

    $db = DB::getConnection();
    
    $stmt = $db->prepare("DELETE FROM mock_endpoints WHERE url_hash = :hash");
    $stmt->execute(['hash' => $hash]);

    echo json_encode([
        "success" => true,
        "deleted" => $hash
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Internal Server Error"]);
}
