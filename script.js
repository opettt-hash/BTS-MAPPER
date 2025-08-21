// assets/script.js - lengkap fitur
// init map
let map = L.map('map', {zoomControl:true}).setView([1.0935, 116.8982], 14);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'&copy; OSM'}).addTo(map);

let sectors = [];
let lobs = [];
let layerGroup = L.featureGroup().addTo(map);

// ---- Undo / Redo stacks ----
let undoStack = [];
let redoStack = [];
function pushState(){
  undoStack.push(JSON.stringify({sectors, lobs}));
  if(undoStack.length > 50) undoStack.shift();
  redoStack = [];
  updateUndoRedoButtons();
}
function updateUndoRedoButtons(){
  document.getElementById('undoBtn').disabled = undoStack.length === 0;
  document.getElementById('redoBtn').disabled = redoStack.length === 0;
}
function doUndo(){
  if(undoStack.length === 0) return;
  let cur = JSON.stringify({sectors, lobs});
  redoStack.push(cur);
  let prev = undoStack.pop();
  let obj = JSON.parse(prev);
  sectors = obj.sectors || [];
  lobs = obj.lobs || [];
  redrawAll();
  updateLayerList();
  updateUndoRedoButtons();
}
function doRedo(){
  if(redoStack.length === 0) return;
  let cur = JSON.stringify({sectors, lobs});
  undoStack.push(cur);
  let next = redoStack.pop();
  let obj = JSON.parse(next);
  sectors = obj.sectors || [];
  lobs = obj.lobs || [];
  redrawAll();
  updateLayerList();
  updateUndoRedoButtons();
}

// helpers
const toRad = d => d * Math.PI / 180;
const toDeg = r => r * 180 / Math.PI;

// draw functions
function drawSector(s){
  const {lat,lng,azimuth,beam,radius,color,name} = s;
  const pts = [];
  const step = Math.max(3, Math.floor(beam/6));
  const start = azimuth - beam/2;
  pts.push([lat,lng]);
  for(let a=start; a<=azimuth+beam/2; a+=step){
    const br = toRad(a);
    const destLat = lat + (radius/1000) * Math.cos(br) / 111;
    const destLng = lng + (radius/1000) * Math.sin(br) / (111 * Math.cos(toRad(lat)));
    pts.push([destLat,destLng]);
  }
  pts.push([lat,lng]);
  const poly = L.polygon(pts, {color:color||'#1fbf9c', fillOpacity:0.12, weight:2}).bindPopup(`<b>${name||'Sektor'}</b><br>Az:${azimuth}° Beam:${beam}° R:${radius}m`);
  layerGroup.addLayer(poly);
  return poly;
}
function drawLob(l){
  const {lat,lng,bearing,length,label} = l;
  const br = toRad(bearing);
  const km = parseFloat(length);
  const destLat = lat + (km) * Math.cos(br) / 111;
  const destLng = lng + (km) * Math.sin(br) / (111 * Math.cos(toRad(lat)));
  const line = L.polyline([[lat,lng],[destLat,destLng]], {color:'#ff7b6b', dashArray:'6,6', weight:3}).bindPopup(`<b>LOB</b><br>${label||''}`);
  layerGroup.addLayer(line);
  return line;
}
function redrawAll(){
  layerGroup.clearLayers();
  sectors.forEach((s,i)=>{
    const layer = drawSector(s);
    layer._meta = {type:'sector', idx:i};
  });
  lobs.forEach((l,i)=>{
    const layer = drawLob(l);
    layer._meta = {type:'lob', idx:i};
  });
}
function updateLayerList(){
  const div = document.getElementById('layerList');
  div.innerHTML = '';
  // sectors first
  sectors.forEach((s,i)=>{
    const el = document.createElement('div');
    el.className = 'layer-item';
    el.innerHTML = `<div class="meta"><b>${s.name}</b><br>Sector ${i+1}</div>
      <div style="display:flex;gap:6px">
        <button onclick="focusLayer('sector',${i})">Go</button>
        <button onclick="deleteLayer('sector',${i})">Hapus</button>
      </div>`;
    div.appendChild(el);
  });
  lobs.forEach((l,i)=>{
    const el = document.createElement('div');
    el.className = 'layer-item';
    el.innerHTML = `<div class="meta"><b>${l.label||'LOB ' + (i+1)}</b><br>LOB ${i+1}</div>
      <div style="display:flex;gap:6px">
        <button onclick="focusLayer('lob',${i})">Go</button>
        <button onclick="deleteLayer('lob',${i})">Hapus</button>
      </div>`;
    div.appendChild(el);
  });
}

// focus or delete layer
function focusLayer(type, idx){
  if(type === 'sector'){
    const s = sectors[idx];
    map.setView([s.lat,s.lng], 15);
  }else{
    const l = lobs[idx];
    map.setView([l.lat,l.lng], 15);
  }
}
function deleteLayer(type, idx){
  if(!confirm('Yakin hapus?')) return;
  pushState();
  if(type === 'sector'){
    sectors.splice(idx,1);
  } else {
    lobs.splice(idx,1);
  }
  redrawAll();
  updateLayerList();
}

// UI bindings
document.getElementById('addSectorBtn').addEventListener('click', ()=>{
  pushState();
  const s = {
    name: document.getElementById('sectorName').value || `Sektor ${sectors.length+1}`,
    lat: parseFloat(document.getElementById('lat').value) || 0,
    lng: parseFloat(document.getElementById('lng').value) || 0,
    azimuth: parseFloat(document.getElementById('azimuth').value) || 0,
    beam: parseFloat(document.getElementById('beam').value) || 120,
    radius: parseFloat(document.getElementById('radius').value) || 800,
    color: document.getElementById('color').value || '#1fbf9c'
  };
  sectors.push(s);
  redrawAll();
  updateLayerList();
});
document.getElementById('clearSectorsBtn').addEventListener('click', ()=>{
  if(!confirm('Hapus semua sektor?')) return;
  pushState();
  sectors = [];
  redrawAll();
  updateLayerList();
});
document.getElementById('addLobBtn').addEventListener('click', ()=>{
  pushState();
  const l = {
    lat: parseFloat(document.getElementById('lobLat').value) || 0,
    lng: parseFloat(document.getElementById('lobLng').value) || 0,
    bearing: parseFloat(document.getElementById('lobBearing').value) || 0,
    length: parseFloat(document.getElementById('lobLength').value) || 10,
    label: `LOB ${lobs.length+1}`
  };
  lobs.push(l);
  redrawAll();
  updateLayerList();
});
document.getElementById('clearLobBtn').addEventListener('click', ()=>{
  if(!confirm('Hapus semua LOB?')) return;
  pushState();
  lobs = [];
  redrawAll();
  updateLayerList();
});

// Fit semua
document.getElementById('fitBtn').addEventListener('click', ()=>{
  if(layerGroup.getLayers().length === 0){ alert('Tidak ada layer.'); return; }
  map.fitBounds(layerGroup.getBounds(), {padding:[40,40]});
});

// Export JSON
document.getElementById('exportBtn').addEventListener('click', ()=>{
  const payload = {meta:{generated:new Date().toISOString()}, sectors, lobs};
  const blob = new Blob([JSON.stringify(payload, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'btsmapper_export.json'; document.body.appendChild(a);
  a.click(); a.remove(); URL.revokeObjectURL(url);
});

// Import JSON
document.getElementById('importFile').addEventListener('change', function(){
  const f = this.files[0]; if(!f) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try{
      const parsed = JSON.parse(e.target.result);
      pushState();
      sectors = parsed.sectors || [];
      lobs = parsed.lobs || [];
      redrawAll(); updateLayerList(); alert('Import berhasil');
    }catch(err){ alert('Gagal parse JSON: ' + err.message); }
  };
  reader.readAsText(f); this.value = '';
});

// Save to server (simple file)
document.getElementById('saveServerBtn').addEventListener('click', ()=>{
  const payload = {meta:{generated:new Date().toISOString()}, sectors, lobs};
  fetch('save_json.php', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)})
    .then(r=>r.json()).then(j=>{
      if(j && j.ok) alert('Saved: ' + j.file); else alert('Save failed: ' + (j.error||'unknown'));
    }).catch(err=>alert('Error: ' + err.message));
});

// Shift+click map to fill lat/lng
map.on('click', function(e){
  if(!e.originalEvent.shiftKey) return;
  document.getElementById('lat').value = e.latlng.lat.toFixed(6);
  document.getElementById('lng').value = e.latlng.lng.toFixed(6);
  document.getElementById('lobLat').value = e.latlng.lat.toFixed(6);
  document.getElementById('lobLng').value = e.latlng.lng.toFixed(6);
});

// Triangulasi: least-squares + naive
function triangulateLeastSquares(){
  // For each LOB: point p_i = [lat_i, lng_i], bearing theta_i
  // normal vector n_i = [-sin theta, cos theta]
  // equation: n_i dot X = n_i dot p_i  => A X = b
  if(lobs.length < 2) return null;
  // build A and b
  const A = [];
  const b = [];
  for(const l of lobs){
    const theta = toRad(l.bearing);
    const ni_lat = -Math.sin(theta);
    const ni_lng = Math.cos(theta) / Math.cos(toRad(l.lat)); // scale lng component to approx degrees
    const dot = ni_lat * l.lat + ni_lng * l.lng;
    A.push([ni_lat, ni_lng]);
    b.push(dot);
  }
  // solve using normal equations: x = (A^T A)^-1 A^T b
  // compute ATA (2x2) and ATb (2x1)
  let ATA = [[0,0],[0,0]];
  let ATb = [0,0];
  for(let i=0;i<A.length;i++){
    ATA[0][0] += A[i][0]*A[i][0];
    ATA[0][1] += A[i][0]*A[i][1];
    ATA[1][0] += A[i][1]*A[i][0];
    ATA[1][1] += A[i][1]*A[i][1];
    ATb[0] += A[i][0]*b[i];
    ATb[1] += A[i][1]*b[i];
  }
  // invert ATA 2x2
  const det = ATA[0][0]*ATA[1][1] - ATA[0][1]*ATA[1][0];
  if(Math.abs(det) < 1e-12) return null;
  const inv = [
    [ ATA[1][1]/det, -ATA[0][1]/det],
    [-ATA[1][0]/det,  ATA[0][0]/det]
  ];
  const x0 = inv[0][0]*ATb[0] + inv[0][1]*ATb[1];
  const x1 = inv[1][0]*ATb[0] + inv[1][1]*ATb[1];
  return [x0, x1]; // lat, lng
}

function triangulateNaive(){
  // pairwise intersection average (approx)
  if(lobs.length < 2) return null;
  const inters = [];
  for(let i=0;i<lobs.length;i++){
    for(let j=i+1;j<lobs.length;j++){
      const A = lobs[i], B = lobs[j];
      // represent line param: p + t*d
      const ai = toRad(A.bearing);
      const bi = toRad(B.bearing);
      const dA = [Math.cos(ai), Math.sin(ai)/(Math.cos(toRad(A.lat)))];
      const dB = [Math.cos(bi), Math.sin(bi)/(Math.cos(toRad(B.lat)))];
      // Solve pA + t*dA = pB + u*dB
      const a1 = dA[0], b1 = -dB[0], c1 = B.lat - A.lat;
      const a2 = dA[1], b2 = -dB[1], c2 = B.lng - A.lng;
      const det = a1*b2 - a2*b1;
      if(Math.abs(det) < 1e-12) continue;
      const t = (c1*b2 - c2*b1) / det;
      const ix = A.lat + t*dA[0];
      const iy = A.lng + t*dA[1];
      inters.push([ix, iy]);
    }
  }
  if(inters.length === 0) return null;
  const avgLat = inters.reduce((s,p)=>s+p[0],0)/inters.length;
  const avgLng = inters.reduce((s,p)=>s+p[1],0)/inters.length;
  return [avgLat, avgLng];
}

document.getElementById('calcTriBtn').addEventListener('click', ()=>{
  const method = document.getElementById('triangMethod').value;
  let result = null;
  if(method === 'least'){
    result = triangulateLeastSquares();
  } else {
    result = triangulateNaive();
  }
  const out = document.getElementById('triResult');
  if(!result){ out.innerText = 'Triangulasi gagal / data kurang atau paralel.'; return; }
  out.innerHTML = `<b>Estimasi:</b> ${result[0].toFixed(6)}, ${result[1].toFixed(6)}`;
  pushState();
  L.marker([result[0], result[1]], {title:'Estimasi Triangulasi'}).addTo(layerGroup);
  map.panTo([result[0], result[1]]);
  updateLayerList();
});

// Undo / Redo buttons
document.getElementById('undoBtn').addEventListener('click', doUndo);
document.getElementById('redoBtn').addEventListener('click', doRedo);

// initial state push
pushState();
updateLayerList();
updateUndoRedoButtons();

// ---------------- Auth + Projects (simple) ----------------
function showModal(id){ document.getElementById(id).style.display = 'flex'; }
function hideModal(id){ document.getElementById(id).style.display = 'none'; }

document.getElementById('openLoginBtn')?.addEventListener('click', ()=>showModal('authModal'));
document.getElementById('closeAuth')?.addEventListener('click', ()=>hideModal('authModal'));

document.getElementById('btnRegister')?.addEventListener('click', ()=>{
  const u = document.getElementById('authUser').value.trim();
  const p = document.getElementById('authPass').value;
  if(!u || !p) return alert('Isi user/pass');
  fetch('auth.php', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({action:'register',username:u,password:p})})
    .then(r=>r.json()).then(j=>{
      if(j.ok){ alert('Register sukses. Anda sudah login.'); location.reload(); } else alert('Gagal: '+ (j.error||'unknown'));
    }).catch(e=>alert(e));
});

document.getElementById('btnLogin')?.addEventListener('click', ()=>{
  const u = document.getElementById('authUser').value.trim();
  const p = document.getElementById('authPass').value;
  if(!u || !p) return alert('Isi user/pass');
  fetch('auth.php', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({action:'login',username:u,password:p})})
    .then(r=>r.json()).then(j=>{
      if(j.ok){ alert('Login sukses.'); location.reload(); } else alert('Gagal: '+ (j.error||'unknown'));
    }).catch(e=>alert(e));
});

// Projects modal
document.getElementById('openProjectsBtn')?.addEventListener('click', ()=>{ loadProjects(); showModal('projectsModal'); });
document.getElementById('closeProjects')?.addEventListener('click', ()=>hideModal('projectsModal'));

function loadProjects(){
  fetch('list_projects.php').then(r=>r.json()).then(j=>{
    if(!j.ok){ document.getElementById('projectsList').innerText = 'Tidak ada atau belum login.'; return; }
    const container = document.getElementById('projectsList'); container.innerHTML = '';
    for(const p of j.projects){
      const el = document.createElement('div'); el.className='layer-item';
      el.innerHTML = `<div class="meta"><b>${p.name}</b><br><small>${p.created_at}</small></div>
        <div style="display:flex;gap:6px">
          <button onclick="loadProject(${p.id})">Load</button>
          <button onclick="deleteProject(${p.id})">Delete</button>
        </div>`;
      container.appendChild(el);
    }
  });
}

function saveProject(){
  const name = document.getElementById('projectName').value.trim();
  if(!name) return alert('Isi nama project');
  const payload = {name, content:{meta:{generated:new Date().toISOString()}, sectors, lobs}};
  fetch('save_project.php', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)})
    .then(r=>r.json()).then(j=>{
      if(j.ok){ alert('Project disimpan.'); loadProjects(); } else if(j.error=='not_logged'){ alert('Harap login dulu'); showModal('authModal'); }
      else alert('Gagal simpan: ' + (j.error||'unknown'));
    });
}
document.getElementById('saveProjectBtn')?.addEventListener('click', saveProject);

function loadProject(id){
  fetch('load_project.php?id=' + encodeURIComponent(id)).then(r=>r.json()).then(j=>{
    if(!j.ok) return alert('Gagal load: ' + (j.error||''));
    pushState();
    sectors = j.content.sectors || [];
    lobs = j.content.lobs || [];
    redrawAll(); updateLayerList(); hideModal('projectsModal');
  });
}

function deleteProject(id){
  if(!confirm('Hapus project?')) return;
  fetch('save_project.php', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({action:'delete', id})})
    .then(r=>r.json()).then(j=>{
      if(j.ok) loadProjects(); else alert('Gagal hapus');
    });
}

// save file to server -> exports/ (already implemented)
