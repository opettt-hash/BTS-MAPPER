<?php
// index.php - UI utama
session_start();
$logged = isset($_SESSION['user']);
$username = $logged ? $_SESSION['user']['username'] : null;
?>
<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>BTS Mapper By Rolandino </title>

  <!-- Leaflet -->
  <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>

  <link rel="stylesheet" href="assets/style.css">
</head>
<body>
  <div class="topbar">
    <div class="brand">📡 BTS Mapper</div>

    <div class="top-actions">
      <button id="fitBtn">Fit Semua</button>
      <button id="exportBtn">Export JSON</button>
      <label class="import-btn">Import JSON
        <input id="importFile" type="file" accept=".json">
      </label>
      <button id="saveServerBtn">Simpan ke Server</button>

      <?php if($logged): ?>
        <span class="user-badge">Hi, <?=htmlspecialchars($username) ?></span>
        <button id="openProjectsBtn">My Projects</button>
        <a class="link" href="logout.php">Logout</a>
      <?php else: ?>
        <button id="openLoginBtn">Login / Register</button>
      <?php endif; ?>
    </div>
  </div>

  <div class="app">
    <div id="map"></div>

    <aside class="sidebar">
      <h2>Tambah Sektor</h2>

      <div class="card">
        <label>Nama</label>
        <input id="sectorName" placeholder="Sektor A" value="Sektor 1">

        <div class="row">
          <div><label>Lat</label><input id="lat" type="number" step="0.000001" value="1.093537"></div>
          <div><label>Lng</label><input id="lng" type="number" step="0.000001" value="116.898201"></div>
        </div>

        <div class="row">
          <div><label>Azimuth (°)</label><input id="azimuth" type="number" value="80"></div>
          <div><label>Beam (°)</label><input id="beam" type="number" value="120"></div>
        </div>

        <div class="row">
          <div><label>Radius (m)</label><input id="radius" type="number" value="900"></div>
          <div><label>Warna</label><input id="color" type="color" value="#1fbf9c"></div>
        </div>

        <button id="addSectorBtn">+ Tambah Sektor</button>
        <button id="clearSectorsBtn" class="muted">Bersihkan Sektor</button>
      </div>

      <h2>Line of Bearing (LOB)</h2>
      <div class="card">
        <div class="row">
          <div><label>Lat</label><input id="lobLat" type="number" step="0.000001" value="1.097338"></div>
          <div><label>Lng</label><input id="lobLng" type="number" step="0.000001" value="116.906247"></div>
        </div>

        <div class="row">
          <div><label>Arah (°)</label><input id="lobBearing" type="number" value="90"></div>
          <div><label>Panjang (km)</label><input id="lobLength" type="number" value="10"></div>
        </div>

        <button id="addLobBtn">+ Tambah LOB</button>
        <button id="clearLobBtn" class="muted">Bersihkan LOB</button>
      </div>

      <div class="card small">
        <label>Triangulasi</label>
        <select id="triangMethod">
          <option value="least">Least-squares (recommended)</option>
          <option value="naive">Pairwise intersections (naive)</option>
        </select>
        <button id="calcTriBtn">Hitung</button>
        <div id="triResult" class="result"></div>
      </div>

      <div class="card small">
        <label>Layers</label>
        <div id="layerList" class="layer-list"></div>
        <div class="row">
          <button id="undoBtn">Undo</button>
          <button id="redoBtn">Redo</button>
        </div>
      </div>

      <p class="hint">Tip: klik peta + <kbd>Shift</kbd> untuk isi Lat/Lng. Klik item di <b>Layers</b> untuk fokus/hapus.</p>
    </aside>
  </div>

  <!-- Login / Register modal -->
  <div id="authModal" class="modal" style="display:none">
    <div class="modal-inner">
      <h3>Login / Register</h3>
      <form id="authForm">
        <input id="authUser" placeholder="username" required>
        <input id="authPass" placeholder="password" type="password" required>
        <div class="row">
          <button type="button" id="btnLogin">Login</button>
          <button type="button" id="btnRegister">Register</button>
        </div>
      </form>
      <button class="closeModal" id="closeAuth">Close</button>
    </div>
  </div>

  <!-- Projects modal -->
  <div id="projectsModal" class="modal" style="display:none">
    <div class="modal-inner">
      <h3>My Projects</h3>
      <div id="projectsList"></div>
      <div class="row">
        <input id="projectName" placeholder="Nama project untuk simpan">
        <button id="saveProjectBtn">Save Project</button>
      </div>
      <button class="closeModal" id="closeProjects">Close</button>
    </div>
  </div>

  <script src="assets/script.js"></script>
</body>
</html>
