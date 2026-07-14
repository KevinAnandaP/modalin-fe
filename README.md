# Modalin Frontend (modalin-fe)

Frontend Web Application untuk proyek Modalin menggunakan **Vue 3**, **Vite (Single Page Application)**, dan **Axios** untuk integrasi backend API.

## Prasyarat
- Node.js 18.x / 20.x atau lebih baru
- npm / yarn / pnpm

## Struktur Proyek Utama
```text
modalin-fe/
├── public/               # Aset publik statis
├── src/
│   ├── assets/           # Media & aset lokal (logo, gambar, dll)
│   ├── components/       # Komponen Vue reusable
│   ├── services/
│   │   └── api.js        # Konfigurasi Axios & deteksi offline global
│   ├── App.vue           # Root Component & Developer Dashboard
│   ├── main.js           # Entrypoint aplikasi Vue
│   └── style.css         # CSS global & setup font (Inter & Old Standard TT)
├── .env                  # Variabel lingkungan untuk API Base URL (lokal)
├── .gitignore
├── index.html            # Main HTML file
├── package.json          # File konfigurasi package & dependensi
└── vite.config.js        # Konfigurasi Vite & setup path alias '@'
```

## Cara Menjalankan

1. **Clone repositori** (jika dari repo remote):
   ```bash
   git clone <repository-url>
   cd modalin-fe
   ```

2. **Setup Variabel Lingkungan**:
   Buat file `.env` di root folder proyek:
   ```env
   VITE_API_BASE_URL=http://localhost:8080/api/v1
   ```
   *Sesuaikan `VITE_API_BASE_URL` jika backend dideploy di lingkungan staging/produksi (misalnya `https://api.modalin.my.id/api/v1`).*

3. **Instal Dependensi**:
   ```bash
   npm install
   ```

4. **Jalankan Aplikasi (Development)**:
   ```bash
   npm run dev
   ```
   *Aplikasi secara default akan berjalan di alamat `http://localhost:5173/`.*

5. **Build untuk Produksi**:
   ```bash
   npm run build
   ```
   *Hasil build siap deploy akan diletakkan di dalam folder `dist/`.*

## Standar Integrasi API & Penanganan Error

1. **Axios Client**: Instance Axios dikonfigurasi di dalam [src/services/api.js](file:///c:/Vinneth/Comp/modalin/modalin-fe/src/services/api.js). File ini secara otomatis melampirkan JWT Authorization Token dari `localStorage` jika tersedia.
2. **Deteksi Server Offline**: Terdapat reactive state `isApiOffline` yang akan bernilai `true` jika koneksi ke backend gagal secara total (network error). Halaman statis yang tidak memerlukan API akan tetap berfungsi normal.
3. **Mekanisme Validasi Error**: Validasi gagal dari backend (`400 Bad Request` dari validator Go) dikembalikan dalam bentuk array error. Frontend memetakan field `failed_field` (contoh: `User.Email`) ke form input bersangkutan menggunakan modul parser validasi di Vue.

---

## Alur Kerja Git Branching (Git Workflow)

1. **Daftar Branch Utama**:
   - `main` : Branch rilis untuk lingkungan Produksi (*Production*).
   - `staging` : Branch rilis untuk lingkungan Pra-Produksi (*Staging/Testing*).
   - `dev` : Branch utama pengembangan (*Development*). Semua integrasi fitur baru disatukan di sini.

2. **Aturan Pembuatan Branch**:
   - Seluruh pengerjaan fitur baru atau perbaikan bug **wajib** dibuat dari branch **`dev`**.
   - Gunakan format penamaan branch berikut:
     - Fitur Baru: **`feat/nama-fitur`** (contoh: `feat/landing-page`)
     - Perbaikan Bug/Fixing: **`fix/deskripsi-error`** (contoh: `fix/input-validation-reset`)

3. **Alur Penggabungan (Merge)**:
   - Setelah pengerjaan di branch `feat/` atau `fix/` selesai dan teruji, gabungkan kembali (**merge**) hasil pekerjaan tersebut ke branch **`dev`**.
