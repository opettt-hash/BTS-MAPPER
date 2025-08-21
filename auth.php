<?php
// auth.php - register/login (JSON API)
session_start();
header('Content-Type: application/json');

$raw = file_get_contents('php://input');
$req = $raw ? json_decode($raw, true) : $_POST;
if(!$req){ echo json_encode(['ok'=>false,'error'=>'no_input']); exit; }
$action = $req['action'] ?? null;

$db = new PDO('sqlite:' . __DIR__ . '/db/btsmapper.sqlite');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

if($action === 'register'){
  $user = trim($req['username'] ?? '');
  $pass = $req['password'] ?? '';
  if(!$user || !$pass) { echo json_encode(['ok'=>false,'error'=>'missing']); exit; }
  $hash = password_hash($pass, PASSWORD_DEFAULT);
  $stmt = $db->prepare("INSERT INTO users (username, password, created_at) VALUES (?, ?, datetime('now'))");
  try{
    $stmt->execute([$user, $hash]);
    // auto login
    $uid = $db->lastInsertId();
    $_SESSION['user'] = ['id'=>$uid, 'username'=>$user];
    echo json_encode(['ok'=>true]);
  }catch(Exception $e){
    echo json_encode(['ok'=>false,'error'=>'exists']);
  }
  exit;
}
if($action === 'login'){
  $user = trim($req['username'] ?? '');
  $pass = $req['password'] ?? '';
  if(!$user || !$pass) { echo json_encode(['ok'=>false,'error'=>'missing']); exit; }
  $stmt = $db->prepare("SELECT id, username, password FROM users WHERE username = ?");
  $stmt->execute([$user]);
  $row = $stmt->fetch(PDO::FETCH_ASSOC);
  if(!$row || !password_verify($pass, $row['password'])){ echo json_encode(['ok'=>false,'error'=>'invalid']); exit; }
  $_SESSION['user'] = ['id'=>$row['id'],'username'=>$row['username']];
  echo json_encode(['ok'=>true]);
  exit;
}

echo json_encode(['ok'=>false,'error'=>'unknown_action']);
