<?php
// backend/cron/cleanup.php

// Ensure it's not being called publicly
if (php_sapi_name() !== 'cli') {
    http_response_code(403);
    echo "CLI execution only.";
    exit;
}

// Adjust relative path appropriately if running from cron
require_once dirname(__DIR__) . '/config/db.php';

try {
    $db = DB::getConnection();
    
    // Clear any endpoints whose `expires_at` has passed
    $stmt = $db->prepare("DELETE FROM mock_endpoints WHERE expires_at IS NOT NULL AND expires_at < NOW()");
    $stmt->execute();
    
    $count = $stmt->rowCount();
    echo "Cleanup successful. Deleted $count expired endpoint(s).\n";

} catch (Exception $e) {
    error_log("Error during cron cleanup: " . $e->getMessage());
    echo "Error during cleanup: " . $e->getMessage() . "\n";
    exit(1);
}
