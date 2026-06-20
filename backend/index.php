<?php
// backend/index.php

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
http_response_code(404);

echo json_encode([
    "success" => false,
    "error" => "MockDrop API endpoint not found"
]);
