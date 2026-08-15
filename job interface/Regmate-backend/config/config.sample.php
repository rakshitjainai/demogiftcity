<?php
/* RegMate backend configuration TEMPLATE.
   ------------------------------------------------------------------
   IMPORTANT: Do NOT overwrite your existing config/config.php with this.
   Your live config already has the correct DB credentials.
   This file only documents the required constants + helper functions.
   If you ever recreate config.php, copy this to config.php and fill in
   FRESH credentials (rotate the ones that were exposed).                */

define('DB_HOST', 'localhost');
define('DB_NAME', 'YOUR_DB_NAME');
define('DB_USER', 'YOUR_DB_USER');
define('DB_PASS', 'YOUR_NEW_DB_PASSWORD');     // rotate the old one

define('ADMIN_PASSWORD', 'YOUR_NEW_ADMIN_PASSWORD'); // rotate the old one

define('OWNER_EMAIL', 'you@example.com');
define('MAIL_FROM', 'no-reply@csatwork.in');

define('APP_NAME', 'RegMate');
define('SESSION_DAYS', 365);

function db() {
    static $pdo = null;
    if ($pdo instanceof PDO) return $pdo;
    $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false
    ]);
    return $pdo;
}
function json_response($data, $status=200) {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}
function body_json() {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}
function token() { return bin2hex(random_bytes(32)); }
function clean($value, $max=500) { $value = trim((string)$value); return mb_substr($value, 0, $max); }
function valid_email($email) { return filter_var($email, FILTER_VALIDATE_EMAIL); }
function send_owner_email($subject, $html) {
    $headers  = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type: text/html; charset=UTF-8\r\n";
    $headers .= "From: RegMate <" . MAIL_FROM . ">\r\n";
    $headers .= "Reply-To: " . OWNER_EMAIL . "\r\n";
    @mail(OWNER_EMAIL, $subject, $html, $headers);
}
