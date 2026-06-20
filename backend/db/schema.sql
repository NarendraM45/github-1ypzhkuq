CREATE DATABASE IF NOT EXISTS mockdrop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mockdrop;

CREATE TABLE mock_endpoints (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  url_hash     VARCHAR(10) NOT NULL UNIQUE,
  label        VARCHAR(120) DEFAULT NULL,
  json_payload MEDIUMTEXT NOT NULL,
  status_code  SMALLINT UNSIGNED NOT NULL DEFAULT 200,
  delay_ms     SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  cors_enabled TINYINT(1) NOT NULL DEFAULT 1,
  expiry_type  ENUM('never','1h','24h','7d') NOT NULL DEFAULT 'never',
  expires_at   DATETIME DEFAULT NULL,
  hit_count    INT UNSIGNED NOT NULL DEFAULT 0,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE request_logs (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  endpoint_id  INT UNSIGNED NOT NULL,
  requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ip_address   VARCHAR(45) DEFAULT NULL,
  response_ms  SMALLINT UNSIGNED DEFAULT NULL,
  FOREIGN KEY (endpoint_id) REFERENCES mock_endpoints(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_url_hash ON mock_endpoints(url_hash);
CREATE INDEX idx_expires  ON mock_endpoints(expires_at);
