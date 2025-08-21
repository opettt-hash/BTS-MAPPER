<?php
session_start();
header('Content-Type: application/json');
if(!isset($_SESSION['user'])) { echo json_encode(['ok'=>false,'error'=>'not_logged']); exit; }

$raw = file_get_contents('php://input');
$data = $raw ? json_decode($raw, true) : $_POST;
if(!$data){ echo json_encode(['ok'=>false,'error'=>'no_input']); exit; }

$db = new PDO('sqlite:' . __DIR__ . '/db/btsmapper.sqlite');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$action = $data['action'] ?? 'save';
if($action === 'delete'){
  $id = intval($data['id'] ?? 0);
  if(!$id) { echo json_encode(['ok'=>false,'error'=>'no_id']); exit; }
  $stmt = $db->prepare("DELETE FROM projects WHERE id = ? AND user_id = ?");
  $stmt->execute([$id, $_SESSION['user']['id']]);
  echo json_encode(['ok'=>true]); exit;
}

// default save (insert)
$name = trim($data['name'] ?? '');
$content = $data['content'] ?? null;
if(!$name || !$content){ echo json_encode(['ok'=>false,'error'=>'missing']); exit; }
$stmt = $db->prepare("INSERT INTO projects (user_id, name, content, created_at) VALUES (?, ?, ?, datetime('now'))");
$stmt->execute([$_SESSION['user']['id'], $name, json_encode($content, JSON_UNESCAPED_UNICODE)]);
echo json_encode(['ok'=>true,'id'=>$db->lastInsertId()]);
