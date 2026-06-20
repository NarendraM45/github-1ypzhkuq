<?php
// backend/api/serve.php
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Dynamically echo the origin
    if (isset($_SERVER['HTTP_ORIGIN'])) {
        header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    }
    exit(0);
}

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/ratelimit.php';

try {
    // Rate limit: 60 serve requests per IP per minute
    rateLimit('serve', 60, 60);

    $hash = $_GET['hash'] ?? '';
    if (!$hash || !preg_match('/^[a-f0-9]{10}$/i', $hash)) {
        http_response_code(404);
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode(["success" => false, "error" => "Not Found"]);
        exit;
    }

    $db = DB::getConnection();
    
    $stmt = $db->prepare("SELECT * FROM mock_endpoints WHERE url_hash = :hash");
    $stmt->execute(['hash' => $hash]);
    $endpoint = $stmt->fetch();

    if (!$endpoint) {
        http_response_code(404);
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode(["success" => false, "error" => "Not Found"]);
        exit;
    }

    if ($endpoint['expires_at'] && strtotime($endpoint['expires_at']) < time()) {
        // Automatically delete if expired at serve time
        $delStmt = $db->prepare("DELETE FROM mock_endpoints WHERE id = :id");
        $delStmt->execute(['id' => $endpoint['id']]);
        
        http_response_code(410);
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode(["success" => false, "error" => "Endpoint Expired"]);
        exit;
    }

    $ip = $_SERVER['REMOTE_ADDR'] ?? '';

    // Rate Limiting check
    $rateQuery = "
        SELECT COUNT(*) FROM request_logs 
        WHERE endpoint_id = :id 
        AND ip_address = :ip 
        AND requested_at >= DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 60 SECOND)
    ";
    $rateStmt = $db->prepare($rateQuery);
    $rateStmt->execute(['id' => $endpoint['id'], 'ip' => $ip]);
    $hitCount = (int)$rateStmt->fetchColumn();

    if ($hitCount >= 60) {
        http_response_code(429);
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode(["success" => false, "error" => "Too Many Requests"]);
        exit;
    }

    $start = hrtime(true);

    if ((int)$endpoint['delay_ms'] > 0) {
        usleep((int)$endpoint['delay_ms'] * 1000);
    }

    $end = hrtime(true);
    $responseMs = (int)round(($end - $start) / 1e6);

    $db->beginTransaction();
    
    $upStmt = $db->prepare("UPDATE mock_endpoints SET hit_count = hit_count + 1 WHERE id = :id");
    $upStmt->execute(['id' => $endpoint['id']]);
    
    $logStmt = $db->prepare("
        INSERT INTO request_logs (endpoint_id, ip_address, response_ms) 
        VALUES (:id, :ip, :response_ms)
    ");
    $logStmt->execute([
        'id' => $endpoint['id'], 
        'ip' => $ip, 
        'response_ms' => $responseMs
    ]);

    $db->commit();

    header('Content-Type: application/json; charset=UTF-8');
    header('X-MockDrop-Hash: ' . $hash);
    header('X-MockDrop-Served-At: ' . gmdate('Y-m-d\TH:i:s\Z'));
    header('Cache-Control: no-store');

    if ($endpoint['cors_enabled']) {
        if (isset($_SERVER['HTTP_ORIGIN'])) {
            header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
        } else {
            header('Access-Control-Allow-Origin: *');
        }
    }

    http_response_code((int)$endpoint['status_code']);
    
    // Output JSON directly without re-encoding to preserve exactly what the user supplied
    echo $endpoint['json_payload'];

} catch (Exception $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(500);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode(["success" => false, "error" => "Internal Server Error"]);
}
