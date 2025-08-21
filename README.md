# BTS-MAPPER 

**BTS Mapper** adalah aplikasi web berbasis **PHP** dan **LeafletJS** untuk visualisasi **BTS sector**, **Line of Bearing (LOB)**, serta triangulasi pada peta interaktif.  
Aplikasi ini menggunakan **SQLite** sebagai database sehingga ringan, portable, dan mudah dijalankan di berbagai server PHP.

---

## Kegunaan
- Menambahkan dan menampilkan sektor BTS dengan parameter detail (koordinat, azimuth, beamwidth, radius).  
- Membuat dan menampilkan **LOB (Line of Bearing)** untuk analisis arah sinyal.  
- Menyediakan peta interaktif berbasis **LeafletJS** dengan tile OpenStreetMap.  
- Mendukung export data sektor dan LOB ke **JSON** serta import kembali untuk melanjutkan pemetaan sebelumnya.  

---

## Konfigurasi
- **Database:** SQLite, file: `db/btsmapper.sqlite`
- Dibuat secara otomatis oleh `db_init.php`.  
- **Exports:** semua hasil export data tersimpan dalam format JSON pada folder `exports/`.  
- **Map Tile:** menggunakan OpenStreetMap (dapat diganti ke penyedia lain seperti Mapbox atau Google Maps dengan modifikasi kecil di `index.php`).  

---

## Struktur Direktori
/btsmapper
- index.php # Halaman utama (peta interaktif & sidebar)
- export.php # Script export data JSON
- import.php # Script import data JSON
- db_init.php # Inisialisasi database SQLite
- assets/ # File CSS
- js/ # File JavaScript (LeafletJS)
- db/ # Folder database (SQLite)
- exports/ # Folder hasil export JSON
