<?php
session_start();
header('Content-Type: application/json');
if(!isset($_SESSION['user'])) { echo json_encode(['ok'=>false,'error'=>'not_logged']); exit; }

$db = new PDO('sqlite:' . __DIR__ . '/db/btsmapper.sqlite');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$stmt = $db->prepare("SELECT id, name, created_at FROM projects WHERE user_id = ? ORDER BY id DESC");
$stmt->execute([$_SESSION['user']['id']]);
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode(['ok'=>true,'projects'=>$rows]);
