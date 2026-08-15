<?php
require_once __DIR__ . '/../config/config.php';

header('Content-Type: text/html; charset=utf-8');

echo '<!doctype html><html><head><meta charset="utf-8"><title>RegMate Backend Test</title>';
echo '<style>body{font-family:Arial,sans-serif;max-width:760px;margin:40px auto;padding:0 20px;line-height:1.5}';
echo '.ok{color:#176b4d}.bad{color:#a33}.box{padding:16px;border:1px solid #ddd;border-radius:10px;margin:14px 0}';
echo 'input{padding:10px;width:100%;box-sizing:border-box;margin:5px 0 12px}button{padding:11px 18px}</style></head><body>';
echo '<h1>RegMate Backend Test</h1>';

try {
    db()->query('SELECT 1');
    echo '<div class="box ok"><b>✓ Database connection:</b> working</div>';
    foreach (['candidates','activity'] as $table) {
        db()->query("SELECT 1 FROM `$table` LIMIT 1");
        echo '<div class="box ok"><b>✓ Table '.$table.':</b> available</div>';
    }
} catch (Throwable $e) {
    echo '<div class="box bad"><b>✗ Backend/database test failed.</b><br>'.htmlspecialchars($e->getMessage()).'</div>';
}

echo '<div class="box"><b>POST registration test</b>';
echo '<form method="post" action="register.php">';
echo '<input name="name" placeholder="Test name" required>';
echo '<input name="mobile" placeholder="Test mobile" required>';
echo '<input name="email" type="email" placeholder="Test email" required>';
echo '<button type="submit">Test registration</button></form></div>';

echo '<p>Health check: <a href="index.php?action=ping">index.php?action=ping</a></p>';
echo '</body></html>';
