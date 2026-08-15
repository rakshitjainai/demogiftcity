<?php
require_once __DIR__ . '/../config/config.php';

// RegMate API
// Designed for Hostinger / Apache / LiteSpeed.
// Accepts both JSON and application/x-www-form-urlencoded POST requests.

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin === 'https://csatwork.in' || $origin === 'https://www.csatwork.in') {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
}
header('Access-Control-Allow-Headers: Content-Type, Accept');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Max-Age: 86400');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$action = isset($_GET['action']) ? clean($_GET['action'], 40) : '';

// GET health check. Open this URL in a browser after uploading:
// /Regmate-backend/api/index.php?action=ping
if ($action === 'ping') {
    try {
        db()->query('SELECT 1');
        json_response([
            'ok' => true,
            'service' => 'RegMate API',
            'database' => true,
            'method' => $_SERVER['REQUEST_METHOD'] ?? 'GET'
        ]);
    } catch (Throwable $e) {
        json_response([
            'ok' => false,
            'service' => 'RegMate API',
            'database' => false,
            'message' => 'Database connection failed.'
        ], 500);
    }
}

function request_data() {
    // Normal HTML/form POSTs.
    if (!empty($_POST) && is_array($_POST)) {
        return $_POST;
    }

    // JSON POSTs remain supported for compatibility.
    $raw = file_get_contents('php://input');
    if ($raw !== false && trim($raw) !== '') {
        $data = json_decode($raw, true);
        if (is_array($data)) return $data;
    }

    return [];
}

function candidate_response($c, $rawToken) {
    return [
        'ok' => true,
        'candidate_id' => (int)$c['id'],
        'candidate_code' => $c['candidate_code'],
        'access_token' => $rawToken,
        'name' => $c['name'],
        'mobile' => $c['mobile'],
        'email' => $c['email'],
        'role' => $c['role'],
        'experience' => $c['experience'],
        'interview_timing' => $c['interview_timing'],
        'current_page' => $c['current_page'],
        'current_section' => $c['current_section'],
        'current_index' => (int)$c['current_index']
    ];
}

if ($action === 'register') {
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
        json_response(['ok'=>false,'message'=>'Registration requires POST.'],405);
    }

    $d = request_data();
    $name = clean($d['name'] ?? '', 120);
    $mobile = clean($d['mobile'] ?? '', 30);
    $email = strtolower(clean($d['email'] ?? '', 190));
    $role = clean($d['role'] ?? '', 120);
    $experience = clean($d['experience'] ?? '', 60);
    $interview = clean($d['interview_timing'] ?? '', 80);

    if ($name === '' || $mobile === '' || !valid_email($email)) {
        json_response(['ok'=>false,'message'=>'Please enter a valid name, mobile and email.'], 422);
    }

    try {
        $pdo = db();
        $stmt = $pdo->prepare('SELECT id, candidate_code FROM candidates WHERE email=? LIMIT 1');
        $stmt->execute([$email]);
        $existing = $stmt->fetch();

        $rawToken = token();
        $hash = hash('sha256', $rawToken);

        if ($existing) {
            $candidateId = (int)$existing['id'];
            $code = $existing['candidate_code'];
            $stmt = $pdo->prepare('UPDATE candidates SET name=?, mobile=?, role=?, experience=?, interview_timing=?, access_token_hash=?, last_active=NOW() WHERE id=?');
            $stmt->execute([$name,$mobile,$role,$experience,$interview,$hash,$candidateId]);
            $subject = 'RegMate returning candidate';
        } else {
            $code = 'REG-' . strtoupper(bin2hex(random_bytes(3)));
            $stmt = $pdo->prepare('INSERT INTO candidates (candidate_code,name,mobile,email,role,experience,interview_timing,access_token_hash) VALUES (?,?,?,?,?,?,?,?)');
            $stmt->execute([$code,$name,$mobile,$email,$role,$experience,$interview,$hash]);
            $candidateId = (int)$pdo->lastInsertId();
            $subject = 'New RegMate registration — ' . $name;
        }

        $html = '<h2>New RegMate Candidate</h2>'
              . '<p><b>Name:</b> '.htmlspecialchars($name).'</p>'
              . '<p><b>Mobile:</b> '.htmlspecialchars($mobile).'</p>'
              . '<p><b>Email:</b> '.htmlspecialchars($email).'</p>'
              . '<p><b>Role:</b> '.htmlspecialchars($role ?: 'Not selected').'</p>'
              . '<p><b>Experience:</b> '.htmlspecialchars($experience ?: 'Not selected').'</p>'
              . '<p><b>Interview:</b> '.htmlspecialchars($interview ?: 'Not selected').'</p>'
              . '<p><b>Candidate ID:</b> '.htmlspecialchars($code).'</p>';
        send_owner_email($subject, $html);

        $pdo->prepare('INSERT INTO activity (candidate_id,event_name,section_name) VALUES (?,?,?)')
            ->execute([$candidateId,'registration','home']);

        json_response([
            'ok'=>true,
            'candidate_id'=>$candidateId,
            'candidate_code'=>$code,
            'access_token'=>$rawToken
        ]);
    } catch (Throwable $e) {
        json_response(['ok'=>false,'message'=>'Registration could not be completed. Please check the backend database setup.'],500);
    }
}

if ($action === 'login') {
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
        json_response(['ok'=>false,'message'=>'Login requires POST.'],405);
    }

    $d = request_data();
    $email = strtolower(clean($d['email'] ?? '', 190));
    $mobile = clean($d['mobile'] ?? '', 30);

    if (!valid_email($email) || $mobile === '') {
        json_response(['ok'=>false,'message'=>'Please enter your registered email and mobile.'],422);
    }

    try {
        $stmt = db()->prepare('SELECT * FROM candidates WHERE email=? AND mobile=? LIMIT 1');
        $stmt->execute([$email,$mobile]);
        $c = $stmt->fetch();
        if (!$c) {
            json_response(['ok'=>false,'message'=>'We could not find a matching RegMate profile. Check your email and mobile.'],404);
        }

        $rawToken = token();
        db()->prepare('UPDATE candidates SET access_token_hash=?, last_active=NOW() WHERE id=?')
            ->execute([hash('sha256',$rawToken),(int)$c['id']]);
        db()->prepare('INSERT INTO activity (candidate_id,event_name,section_name) VALUES (?,?,?)')
            ->execute([(int)$c['id'],'resume_login','resume']);

        json_response(candidate_response($c, $rawToken));
    } catch (Throwable $e) {
        json_response(['ok'=>false,'message'=>'Login could not be completed. Please check the backend database setup.'],500);
    }
}

function auth_candidate() {
    $d = request_data();
    $id = (int)($d['candidate_id'] ?? 0);
    $raw = (string)($d['access_token'] ?? '');
    if (!$id || strlen($raw) < 40) json_response(['ok'=>false,'message'=>'Unauthorised'],401);

    $stmt = db()->prepare('SELECT * FROM candidates WHERE id=? LIMIT 1');
    $stmt->execute([$id]);
    $c = $stmt->fetch();
    if (!$c || !hash_equals((string)$c['access_token_hash'], hash('sha256',$raw))) {
        json_response(['ok'=>false,'message'=>'Unauthorised'],401);
    }
    db()->prepare('UPDATE candidates SET last_active=NOW() WHERE id=?')->execute([$id]);
    return [$c,$d];
}

if ($action === 'profile') {
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') json_response(['ok'=>false,'message'=>'Profile update requires POST.'],405);
    [$c,$d] = auth_candidate();
    $role = clean($d['role'] ?? $c['role'],120);
    $experience = clean($d['experience'] ?? $c['experience'],60);
    $interview = clean($d['interview_timing'] ?? $c['interview_timing'],80);
    db()->prepare('UPDATE candidates SET role=?,experience=?,interview_timing=?,last_active=NOW() WHERE id=?')
        ->execute([$role,$experience,$interview,$c['id']]);
    json_response(['ok'=>true]);
}

if ($action === 'progress') {
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') json_response(['ok'=>false,'message'=>'Progress update requires POST.'],405);
    [$c,$d] = auth_candidate();
    $page = clean($d['page'] ?? 'home',60);
    $section = clean($d['section'] ?? '',80);
    $index = (int)($d['index'] ?? 0);
    db()->prepare('UPDATE candidates SET current_page=?,current_section=?,current_index=?,last_active=NOW() WHERE id=?')
        ->execute([$page,$section,$index,$c['id']]);
    json_response(['ok'=>true]);
}

if ($action === 'event') {
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') json_response(['ok'=>false,'message'=>'Event requires POST.'],405);
    [$c,$d] = auth_candidate();
    $event = clean($d['event_name'] ?? '',80);
    if ($event === '') json_response(['ok'=>false,'message'=>'Missing event'],422);
    $section = clean($d['section_name'] ?? '',80);
    $itemIndex = isset($d['item_index']) ? (int)$d['item_index'] : null;
    $itemTitle = clean($d['item_title'] ?? '',255);
    $score = isset($d['score']) && $d['score'] !== '' ? (float)$d['score'] : null;
    $meta = isset($d['metadata']) ? json_encode($d['metadata'], JSON_UNESCAPED_UNICODE) : null;
    db()->prepare('INSERT INTO activity (candidate_id,event_name,section_name,item_index,item_title,score,metadata_json) VALUES (?,?,?,?,?,?,?)')
      ->execute([$c['id'],$event,$section,$itemIndex,$itemTitle,$score,$meta]);
    json_response(['ok'=>true]);
}

if ($action === 'resume') {
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') json_response(['ok'=>false,'message'=>'Resume requires POST.'],405);
    [$c,$d] = auth_candidate();
    json_response(['ok'=>true,'candidate'=>[
        'id'=>(int)$c['id'],'code'=>$c['candidate_code'],'name'=>$c['name'],
        'mobile'=>$c['mobile'],'email'=>$c['email'],'role'=>$c['role'],
        'experience'=>$c['experience'],'interview_timing'=>$c['interview_timing'],
        'current_page'=>$c['current_page'],'current_section'=>$c['current_section'],
        'current_index'=>(int)$c['current_index']
    ]]);
}

json_response(['ok'=>false,'message'=>'Unknown action'],404);
