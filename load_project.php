<?php
session_start();
header('Content-Type: application/json');
if(!isset($_SESSION['user'])) { echo json_encode(['ok'=>false,'error'=>'not_logged']); exit; }
$id = intval($_GET['id'] ?? 0);
if(!$id){ echo json_encode(['ok'=>false,'error'=>'no_id']); exit; }

$db = new PDO('sqlite:' . __DIR__ . '/db/btsmapper.sqlite');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$stmt = $db->prepare("SELECT content FROM projects WHERE id = ? AND user_id = ?");
$stmt->execute([$id, $_SESSION['user']['id']]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);
if(!$row) { echo json_encode(['ok'=>false,'error'=>'not_found']); exit; }
$content = json_decode($row['content'], true);
echo json_encode(['ok'=>true,'content'=>$content]);
