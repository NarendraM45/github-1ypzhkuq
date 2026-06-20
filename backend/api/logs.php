<?php
// backend/api/logs.php
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
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

    $db = DB::getConnection();
    $stmt = $db->prepare("SELECT id, hit_count FROM mock_endpoints WHERE url_hash = :hash");
    $stmt->execute(['hash' => $hash]);
    $endpoint = $stmt->fetch();

    if (!$endpoint) {
        http_response_code(404);
        echo json_encode(["success" => false, "error" => "Not Found"]);
        exit;
    }

    $logStmt = $db->prepare("
        SELECT requested_at, ip_address as ip, response_ms 
        FROM request_logs 
        WHERE endpoint_id = :id 
        ORDER BY requested_at DESC 
        LIMIT 50
    ");
    $logStmt->execute(['id' => $endpoint['id']]);
    $logs = $logStmt->fetchAll();

    $maskedLogs = array_map(function($log) {
        // Mask the last two octets of IP (e.g., 192.168.1.1 -> 192.168.x.x)
        $ip = $log['ip'];
        if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
            $parts = explode('.', $ip);
            if (count($parts) === 4) {
                $log['ip'] = "{$parts[0]}.{$parts[1]}.x.x";
            }
        } elseif (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6)) {
            $parts = explode(':', $ip);
            if (count($parts) >= 3) {
                $log['ip'] = "{$parts[0]}:{$parts[1]}:{$parts[2]}:x:x:x:x:x";
            } else {
                $log['ip'] = "Masked IPv6";
            }
        }
        
        // Frontend expects "requested_at" and "ts" isn't explicitly defined, but the prompt says 
        // return { "requested_at": "...", "ip": "...", "response_ms": 12 }
        $formattedDate = gmdate("Y-m-d\TH:i:s\Z", strtotime($log['requested_at']));
        return [
            "requested_at" => $formattedDate,
            "ip" => $log['ip'],
            "response_ms" => (int)$log['response_ms']
        ];
    }, $logs);

    echo json_encode([
        "hash" => $hash,
        "hit_count" => (int)$endpoint['hit_count'],
        "logs" => $maskedLogs
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Internal Server Error"]);
}
