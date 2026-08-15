<?php
require_once __DIR__ . '/../config/config.php';
session_start();

if (isset($_GET['logout'])) { session_destroy(); header('Location: ./'); exit; }

if (isset($_POST['password'])) {
    if (hash_equals(ADMIN_PASSWORD, $_POST['password'])) $_SESSION['regmate_admin'] = true;
    else $error = 'Incorrect password.';
}

if (empty($_SESSION['regmate_admin'])) {
?><!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>RegMate Admin</title>
<style>body{font-family:system-ui;background:#f3f8f6;display:grid;place-items:center;min-height:100vh}.box{background:#fff;padding:32px;border-radius:22px;max-width:380px;width:90%;box-shadow:0 15px 40px #174c4620}input,button{width:100%;padding:14px;border-radius:12px;border:1px solid #ccdcd8;margin-top:10px}button{background:#174c46;color:#fff;border:0;font-weight:700}.err{color:#a6533e}</style></head>
<body><form class="box" method="post"><h1>RegMate Admin</h1><p>Private dashboard</p><?php if(isset($error))echo '<p class="err">'.htmlspecialchars($error).'</p>';?><input type="password" name="password" placeholder="Admin password" required><button>Sign in</button></form></body></html><?php exit; }

$pdo = db();
$total = (int)$pdo->query('SELECT COUNT(*) FROM candidates')->fetchColumn();
$today = (int)$pdo->query("SELECT COUNT(*) FROM candidates WHERE DATE(created_at)=CURDATE()")->fetchColumn();
$active7 = (int)$pdo->query("SELECT COUNT(*) FROM candidates WHERE last_active >= DATE_SUB(NOW(), INTERVAL 7 DAY)")->fetchColumn();
$rows = $pdo->query("SELECT * FROM candidates ORDER BY last_active DESC LIMIT 250")->fetchAll();
?><!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>RegMate Dashboard</title>
<style>
body{margin:0;font-family:system-ui;background:#f3f8f6;color:#172421}.wrap{max-width:1200px;margin:auto;padding:28px 18px}.top{display:flex;justify-content:space-between;gap:12px;align-items:center}.brand{color:#174c46;font-size:30px;font-weight:850}.logout{color:#174c46}.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin:24px 0}.stat{background:#fff;border:1px solid #d6e4e0;border-radius:18px;padding:20px}.stat b{font-size:30px;color:#174c46;display:block;margin-top:6px}table{width:100%;border-collapse:separate;border-spacing:0;background:#fff;border:1px solid #d6e4e0;border-radius:18px;overflow:hidden}th,td{padding:14px;border-bottom:1px solid #e5efec;text-align:left;font-size:14px}th{background:#174c46;color:#fff}tr:last-child td{border-bottom:0}.code{font-weight:800;color:#174c46}.small{color:#667773;font-size:12px}@media(max-width:700px){.stats{grid-template-columns:1fr}.tablewrap{overflow:auto}table{min-width:900px}}
</style></head><body><div class="wrap">
<div class="top"><div><div class="brand">RegMate</div><div class="small">Candidate progress dashboard</div></div><a class="logout" href="?logout=1">Log out</a></div>
<div class="stats"><div class="stat">Total candidates<b><?=$total?></b></div><div class="stat">Registered today<b><?=$today?></b></div><div class="stat">Active in 7 days<b><?=$active7?></b></div></div>
<h2>Candidate activity</h2><div class="tablewrap"><table><tr><th>Candidate</th><th>Contact</th><th>Profile</th><th>Resume point</th><th>Registered</th><th>Last active</th></tr>
<?php foreach($rows as $r): ?><tr>
<td><span class="code"><?=htmlspecialchars($r['candidate_code'])?></span><br><?=htmlspecialchars($r['name'])?></td>
<td><?=htmlspecialchars($r['email'])?><br><?=htmlspecialchars($r['mobile'])?></td>
<td><?=htmlspecialchars($r['role'] ?: 'Not selected')?><br><span class="small"><?=htmlspecialchars($r['experience'] ?: '')?></span></td>
<td><?=htmlspecialchars($r['current_page'])?> / <?=htmlspecialchars($r['current_section'] ?: '-')?> / #<?=((int)$r['current_index']+1)?></td>
<td><?=htmlspecialchars($r['created_at'])?></td>
<td><?=htmlspecialchars($r['last_active'])?></td>
</tr><?php endforeach; ?>
</table></div>
<p class="small">This dashboard intentionally shows candidate identity and progress only to the authenticated admin.</p>
</div></body></html>
