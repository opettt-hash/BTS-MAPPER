<?php
// save_json.php - simpan JSON ke exports/
header('Content-Type: application/json');
$raw = file_get_contents('php://input');
if(!$raw){ echo json_encode(['ok'=>false,'error'=>'No input']); exit; }
$data = json_decode($raw, true);
if($data === null){ echo json_encode(['ok'=>false,'error'=>'Invalid JSON']); exit; }

$dir = __DIR__ . '/exports';
if(!is_dir($dir)) mkdir($dir, 0777, true);
$filename = 'bts_export_' . date('Ymd_His') . '.json';
$path = $dir . '/' . $filename;
if(file_put_contents($path, json_encode($data, JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE)) !== false){
  echo json_encode(['ok'=>true,'file'=>'exports/'.$filename]);
}else{
  echo json_encode(['ok'=>false,'error'=>'Failed write']);
}
