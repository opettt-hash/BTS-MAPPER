<?php
// db_init.php - jalankan sekali untuk buat DB & tabel
$dbdir = __DIR__ . '/db';
if(!is_dir($dbdir)) mkdir($dbdir, 0777, true);
$path = $dbdir . '/btsmapper.sqlite';
$db = new PDO('sqlite:' . $path);
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// users
$db->exec("CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT,
  created_at TEXT
)");

// projects
$db->exec("CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  name TEXT,
  content TEXT,
  created_at TEXT,
  FOREIGN KEY(user_id) REFERENCES users(id)
)");

echo "DB initialized at: $path\n";
echo "Create user via register form in index.php or use save_project (register flow).";
