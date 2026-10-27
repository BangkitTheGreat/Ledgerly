# Ledgerly 📊 — Sistem Manajemen Inventaris & Keuangan UMKM Terintegrasi

[![Origin Induk](https://img.shields.io/badge/Origin%20Induk-Kyrozu%2FLedgerly%3Amain-orange?style=for-the-badge&logo=github)](https://github.com/Kyrozu/Ledgerly/tree/main)
[![Dicoding Capstone](https://img.shields.io/badge/Dicoding-Capstone%20Project%202026-blue?style=for-the-badge&logo=dicoding)](https://www.dicoding.com)
[![Vite](https://img.shields.io/badge/Vite-v6.3-646CFF?style=for-the-badge&logo=vite)](https://vite.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3FCF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![Gemini](https://img.shields.io/badge/Gemini%20AI-2.5%20Flash-8E75C2?style=for-the-badge&logo=googlegemini)](https://deepmind.google/technologies/gemini/)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable%20%26%20Offline-5A0FC8?style=for-the-badge&logo=pwa)](https://web.dev/progressive-web-apps/)

**Ledgerly** adalah platform manajemen inventaris, pembukuan keuangan, dan sistem pendukung keputusan (Decision Support System) berbasis web yang dirancang khusus untuk memberdayakan pelaku Usaha Mikro, Kecil, dan Menengah (UMKM) retail di Indonesia.

> [!NOTE]
> ### 📌 Asal Usul Proyek & Penghargaan Origin
> Repositori ini merupakan versi pengembangan mandiri yang disempurnakan (**Enhanced Edition**) oleh **Bangkit Agung Nugroho** ([@BangkitTheGreat](https://github.com/BangkitTheGreat)).
>
> Proyek ini berakar dan dikembangkan lebih lanjut dari basis proyek tim pada repositori induk:
> 👉 **[`Kyrozu/Ledgerly:main`](https://github.com/Kyrozu/Ledgerly/tree/main)**
> 
> *Versi saat ini menghadirkan perombakan visual modern (UI yang ditingkatkan), arsitektur shell dasbor berbingkai dengan efek aurora & glassmorphism, mode instan **"Coba Demo" (Offline / Zero-Backend)**, halaman Beranda (Ringkasan Toko), halaman Akun, logo baru, serta penguatan performa dan keamanan.*

---

## 👥 Profil Tim (TP-G007)

Proyek ini bermula sebagai **Capstone Project Program Tempa Dicoding 2026** di bawah tema **Smart Business & UMKM Empowerment**:

| ID Peserta | Nama | Learning Path | Peran & Kontribusi Utama |
| :--- | :--- | :--- | :--- |
| **WDC480B6Y0021** | M. Rohid Rivaldi | Web Development | UI Login, AI Chatbot, Integrasi WhatsApp |
| **WDC183B6Y0032** | Anwar Fauzi | Web Development | UI Riwayat & Input Transaksi, Ekspor Laporan |
| **WDC244B6Y0036** | Nathanael Chandra Kusuma | Web Development | UI Dashboard Keuangan, Arsitektur Database |
| **WDC007B6Y0030** | Bangkit Agung Nugroho | Web Development | UI Dashboard Inventory, Decision Support |

### 🎓 Pembimbing & Fasilitator
* **Fasilitator**: Rotua Eka Wati Br. Sitorus (*Web Development Learning Path*)
* **Advisor**: Rully Saputra (*TP26-FS007*)

---

## ✨ Apa yang Baru di Versi Ini? *(Peningkatan dari Kyrozu/Ledgerly:main)*

Pembaruan besar yang diimplementasikan pada branch pembaruan ini meliputi:

| Fitur / Komponen | Peningkatan & Pembaruan | Keterangan & Manfaat |
| :--- | :--- | :--- |
| 🎨 **Desain Antarmuka (UI)** | Redesain visual modern & aurora mesh glow | Tampilan landing page dan dashboard yang jauh lebih estetis, responsif, dan interaktif. |
| 🎮 **Mode "Coba Demo"** | Akses instan *zero-backend* (in-memory) | Dasbor dapat langsung dieksplorasi tanpa perlu mendaftar akun atau konfigurasi database. |
| 🏠 **Halaman Beranda** | Modul ringkasan toko (*store overview*) | Menyajikan kartu hero omzet, grafik *sparkline* 14 hari, *gauge meter* performa, dan produk terlaris. |
| 👤 **Halaman Akun** | Manajemen profil mandiri | Rincian identitas toko, avatar inisial dinamis, status paket langganan, dan ringkasan katalog. |
| 🖼️ **Shell Dasbor Canvas** | Tata letak berbingkai (*framed canvas*) | Desain dashboard modern dengan panel melengkung, navigasi terkelompok rapi, dan jam topbar WIB. |
| 📑 **Alur Autentikasi** | Verifikasi email & konfirmasi sandi ganda | Onboarding pendaftaran dilengkapi validasi 2 langkah dan halaman panduan `konfirmasi.html`. |
| 🏷️ **Identitas Visual** | Logo vektor baru (`assets/logo.svg`) | Simbol visual modern yang memadukan panel dasbor, grafik donat, kurva tren, dan batang persediaan. |
| 🗄️ **Supabase Mandiri** | Skema basis data terstruktur & idempotent | File `supabase_schema.sql` siap pakai untuk replikasi dan deployment mandiri lengkap dengan RLS. |

1. **Desain Landing Page Modern (UI yang Ditingkatkan)**:
   - Tampilan hero section dengan aurora glowing effect dan partikel interaktif.
   - Komponen showcase Bento Grid dinamis dengan kartu berorientasi fitur.
   - Transisi dark mode yang mulus tanpa kedip (*anti-FOUC*), warna border indigo glow, dan kontras teks yang nyaman di mata.
   - Library efek khusus di [`js/efek/landing-efek.js`](js/efek/landing-efek.js) untuk interaksi kartu, spotlight kursor, dan scroll halus.

2. **Mode "Coba Demo" Tanpa Backend**:
   - Memungkinkan calon pengguna maupun penguji menguji seluruh kapabilitas Ledgerly secara langsung tanpa perlu registrasi atau konfigurasi backend Supabase.
   - Didukung oleh [`js/demo.js`](js/demo.js) yang memotong pemanggilan database dan menggantikannya dengan penyimpanan mock berbasis `sessionStorage`.
   - Mengisolasi data demo dari akun pengguna asli di `localStorage` (*auto backup & restore*).
   - Turnstile CAPTCHA otomatis dinonaktifkan secara opsional di lingkungan demo.

3. **Halaman Beranda Baru (Ringkasan Toko / Store Overview)**:
   - Terletak di [`public/pages/beranda.html`](public/pages/beranda.html) dan diotaki oleh [`js/pages/beranda.js`](js/pages/beranda.js).
   - Menghadirkan *Hero Card* omzet hari ini dan laba bersih 30 hari terakhir.
   - Grafik garis mini (*sparkline*) tren pendapatan 14 hari terakhir.
   - Meteran *gauge* kesehatan operasional toko dan diagram distribusi metode transaksi (Tunai, QRIS, Transfer).

4. **Halaman Akun Baru (User & Business Identity)**:
   - File antarmuka di [`public/pages/akun.html`](public/pages/akun.html) dan logika di [`js/pages/akun.js`](js/pages/akun.js).
   - Tampilan profil terstruktur: avatar inisial dinamis, badge paket keanggotaan, status verifikasi, dan statistik inventaris toko.

5. **Shell Dasbor Berbingkai (*Framed Canvas*)**:
   - Pembaruan pada [`css/dasbor.css`](css/dasbor.css) menghadirkan shell bergaya aplikasi SaaS modern dengan latar belakang bertekstur, kanvas konten bersudut melengkung (*rounded inner frame*), dan topbar jam berdetak real-time WIB.
   - Sidebar navigasi yang terkelompok rapi dengan ikon modern dan animasi minimize yang halus.

6. **Penyempurnaan Autentikasi & Halaman Konfirmasi Email**:
   - Halaman pendaftaran baru dilengkapi konfirmasi sandi 2 langkah dan validasi kekuatan sandi langsung.
   - Penambahan [`konfirmasi.html`](konfirmasi.html) untuk alur verifikasi email pengguna baru.
   - Efek visual auth terisolasi di [`js/efek/auth-efek.js`](js/efek/auth-efek.js).

7. **Skema Basis Data Supabase Mandiri**:
   - File [`supabase_schema.sql`](supabase_schema.sql) yang diperbarui menyeluruh, siap dieksekusi dalam satu klik di SQL Editor Supabase untuk mereplikasi struktur tabel, enum, trigger auto-profiling, RLS security policies, dan fungsi database.

---

## 🚀 Fitur Unggulan Sistem

### 1. 🏠 Beranda Ringkasan Toko
* Ringkasan instan performa toko hari ini (omzet, jumlah pesanan, dan laba bersih).
* Visualisasi grafik tren omzet 14 hari terakhir dan pengukur persentase margin keuntungan (*gauge chart*).
* Tabel peringkat produk terlaris (*best sellers*) dan pemecahan persentase metode pembayaran (QRIS, Tunai, Transfer).

### 2. 📦 Manajemen Inventaris Real-Time
* Pelacakan stok akurat dengan peringatan otomatis saat stok menyentuh titik pemesanan ulang (*reorder point warning*).
* Valuasi modal total barang otomatis berdasarkan harga pokok persediaan.
* Manajemen kategori barang kustom langsung dari dashboard.
* Operasi massal: *select all*, hapus massal, dan filter multi-kondisi.

### 3. 📷 Pemindai Barcode & Generator QR Code
* Pemindai barcode langsung menggunakan kamera smartphone atau webcam via [`html5-qrcode`](public/js/vendor/html5-qrcode.min.js) untuk input barang dan verifikasi transaksi tanpa mesin scanner eksternal.
* Pembuatan QR Code otomatis per SKU produk menggunakan [`qrious`](public/js/vendor/qrious.min.js) yang dapat diunduh dalam format PNG untuk label rak fisik.
* Fitur auto-suggest SKU unik yang otomatis digenerasi dari nama produk.

### 4. 💰 Dashboard Keuangan & Laporan Laba Rugi
* Penghitungan otomatis Arus Kas Masuk, Arus Kas Keluar, HPP (Harga Pokok Penjualan), dan Laba Bersih riil.
* Grafik komparasi Omzet vs HPP bulanan menggunakan [`Chart.js`](public/js/vendor/chart.umd.min.js).
* Filter periode interaktif menggunakan Date Range Picker (7 hari, 30 hari, bulan ini, atau rentang kustom).

### 5. 📑 Ekspor & Impor Data Fleksibel
* Impor puluhan transaksi atau stok sekaligus via CSV dropzone menggunakan [`PapaParse`](public/js/vendor/papaparse.min.js).
* Ekspor laporan keuangan resmi ke PDF instan via [`jsPDF`](public/js/vendor/jspdf.umd.min.js).
* Ekspor buku kas ke Excel (`.xlsx`) berformula dinamis (*SUM formula*) menggunakan [`ExcelJS`](public/js/vendor/exceljs.min.js).

### 6. 🤖 Asisten Pintar AI (Ledgerly AI & Voice Input)
* Berinteraksi melalui teks maupun suara via Web Speech API (`webkitSpeechRecognition`) dalam Bahasa Indonesia.
* Algoritma *Local NLP Parser* dengan toleransi salah ketik (*Levenshtein Distance & Anagram Matching*) — contoh: mengetik *"tambah 5 telru"* otomatis mendeteksi transaksi *"Telur Ayam"*.
* Analisis cerdas prediksi kebutuhan restock dan tren penjualan yang ditenagai model Google Gemini 2.5 Flash via proxy serverless ber-JWT.

### 7. 📲 Notifikasi & Bot WhatsApp Gateway
* Sistem peringatan otomatis ke nomor WhatsApp pemilik toko saat stok barang mencapai batas minimum.
* Terintegrasi dengan bot WhatsApp berbasis Node.js + [Baileys](https://github.com/WhiskeySockets/Baileys) (terpisah di repo [**Ledgerly-bot-wa**](https://github.com/rohidrivaldi/Ledgerly-bot-wa)).
* Perintah interaktif via chat WhatsApp (`/stok`, `/ringkasan`, `/menu`, `/ping`).

### 8. 🛡️ Dasbor Superadmin & Kontrol Platform
* Panel manajemen pemilik UMKM (tambah akun langsung dengan kredensial lengkap, monitor paket Starter, Bisnis, & Enterprise).
* Statistik distribusi paket langganan dan status operasional layanan platform (Supabase, Gemini AI, WhatsApp Gateway).
* Pusat pengumuman (*Announcement Board*) yang terkirim serentak ke dashboard semua pemilik toko.

### 9. 🌓 Tema Gelap (Dark Mode) Anti-Kedip
* Sakelar mode terang/gelap di seluruh halaman dengan penyimpanan preferensi di `localStorage`.
* Diterapkan sebelum proses rendering DOM (*anti-FOUC*) sehingga tidak ada kedipan warna putih saat membuka halaman di malam hari.

### 10. 📲 Progressive Web Apps (PWA) Offline-Ready
* Mendukung instalasi aplikasi langsung ke layar utama (*Add to Home Screen*) di Android, iOS, Windows, dan macOS.
* Service Worker pintar berstrategi *network-first with fallback cache* untuk akses data katalog secara offline saat sinyal terputus.

---

## 🛠️ Arsitektur Teknologi & Dependensi

Ledgerly dibangun dengan arsitektur **Pure Decoupled SPA & Multi-Page Application (MPA)** yang cepat, modular, dan ringan:

* **Frontend**: Vanilla HTML5, Vanilla CSS3 (Custom Design System dengan variabel HSL), JavaScript Modern (ES6+).
* **Build Tool**: [Vite](https://vite.dev) (HMR instan, inject environment variables, MPA rollup bundler).
* **Backend Database & Auth**: [Supabase](https://supabase.com) (PostgreSQL, Supabase Auth OAuth 2.0 & Email, Row-Level Security).
* **Serverless Functions**: Vercel Serverless (`api/create-user.js`, `api/chatbot.js`, `api/delete-orphan.js`).
* **Kecerdasan Buatan**: Google Gemini AI (`gemini-2.5-flash`) via streaming SSE.
* **Strategi Vendor Self-Hosted (Anti-503 & Zero CDN Runtime)**:
  Semua pustaka pihak ketiga diunduh dan dijalankan secara lokal di folder [`public/js/vendor/`](public/js/vendor/) guna menjamin keandalan saat CDN publik mengalami gangguan serta mendukung Content Security Policy (CSP) ketat:
  - `chart.umd.min.js` — Visualisasi grafik & gauge
  - `supabase.min.js` — SDK koneksi Supabase
  - `jspdf.umd.min.js` — Pembuat laporan format PDF
  - `exceljs.min.js` & `xlsx.full.min.js` — Manipulasi berkas spreadsheet Excel
  - `papaparse.min.js` — Parser CSV cepat
  - `html5-qrcode.min.js` — Pembaca barcode & QR melalui kamera
  - `qrious.min.js` — Pembuat gambar QR Code
  - `lenis.min.js` — Pengerak scroll halus di landing page

---

## 📂 Struktur Direktori Proyek

```
ledgerly/
├── index.html                  # Landing page utama (Desain Aurora, UI yang ditingkatkan)
├── login.html                  # Halaman masuk (+ Google OAuth & Turnstile)
├── register.html               # Halaman pendaftaran akun baru
├── konfirmasi.html             # Halaman instruksi konfirmasi email
├── dasbor.html                 # Shell utama Single Page Application (SPA)
├── syarat-ketentuan.html       # Halaman syarat & ketentuan layanan
├── kebijakan-privasi.html      # Halaman kebijakan privasi
│
├── css/
│   ├── style.css               # Desain token global, reset, variabel warna
│   ├── landing.css             # Styling landing page (Hero, Bento grid, Aurora)
│   ├── login.css               # Styling halaman autentikasi login
│   ├── register.css            # Styling halaman pendaftaran
│   ├── dasbor.css              # Styling shell dasbor berbingkai & sidebar
│   ├── daterangepicker.css     # Komponen pemilih tanggal kustom
│   └── theme.css               # Palet tema gelap (dark mode overrides)
│
├── js/
│   ├── app.js                  # State management global (Proxy ES6) & router SPA
│   ├── data.js                 # Data mock awal toko
│   ├── demo.js                 # Engine mode "Coba Demo" tanpa backend
│   ├── export.js               # Helper ekspor PDF, Excel, dan CSV
│   ├── register.js             # Validasi registrasi, indikator password, paket
│   ├── supabase.js             # Client Supabase & sinkronisasi sesi
│   ├── theme.js                # Penangan sakelar mode gelap/terang
│   ├── utils.js                # Helper format rupiah, ikon SVG, escape XSS
│   ├── chat-demo.js            # Simulasi obrolan AI di landing page
│   ├── efek/
│   │   ├── auth-efek.js        # Efek visual glow & floating card di halaman auth
│   │   └── landing-efek.js     # Efek spotlight, tilt card, dan smooth scroll
│   ├── komponen/
│   │   ├── chatbot.js          # Widget FAB chatbot & NLP voice assistant
│   │   ├── sidebar.js          # Navigasi sidebar dinamis sesuai peran pengguna
│   │   ├── topbar.js           # Header topbar, jam WIB, & pencarian
│   │   └── upload.js           # Penanganan dropzone impor berkas CSV
│   └── pages/                  # Logika interaktif per halaman dasbor
│       ├── beranda.js          # Logika kartu ringkasan toko & sparkline
│       ├── akun.js             # Logika profil pengguna & informasi paket
│       ├── inventaris.js       # Logika katalog produk, stok kritis, QR code
│       ├── keuangan.js         # Logika grafik omzet vs HPP & arus kas
│       ├── transaksi.js        # Logika input transaksi & filter riwayat
│       ├── laporan.js          # Logika rekapitulasi laba rugi & ekspor
│       ├── keputusan.js        # Logika rekomendasi restock & ranking
│       ├── pengaturan.js       # Logika konfigurasi toko & nomor WhatsApp
│       ├── pengumuman.js       # Logika tampilan papan info untuk pemilik
│       ├── kelola-pemilik.js   # Logika superadmin manajemen toko
│       ├── kelola-pengumuman.js# Logika superadmin publikasi pengumuman
│       ├── pengaturan-platform.js # Logika superadmin konfigurasi sistem
│       └── dasbor-superadmin.js# Logika ringkasan kesehatan platform
│
├── public/                     # Aset publik statis (MIME Types aman)
│   ├── pages/                  # Partial HTML template yang dimuat oleh router SPA
│   │   ├── beranda.html        # Kerangka HTML halaman Beranda
│   │   ├── akun.html           # Kerangka HTML halaman Akun
│   │   ├── inventaris.html     # Kerangka HTML katalog barang
│   │   ├── keuangan.html       # Kerangka HTML dasbor keuangan
│   │   ├── transaksi.html      # Kerangka HTML pencatatan transaksi
│   │   ├── laporan.html        # Kerangka HTML laporan laba rugi
│   │   ├── keputusan.html      # Kerangka HTML rekomendasi cerdas
│   │   ├── pengaturan.html     # Kerangka HTML pengaturan toko
│   │   ├── pengumuman.html     # Kerangka HTML papan info pengguna
│   │   ├── dasbor-superadmin.html # Kerangka HTML metrik admin
│   │   ├── kelola-pemilik.html # Kerangka HTML tabel pemilik toko
│   │   ├── kelola-pengumuman.html # Kerangka HTML pengumuman admin
│   │   └── pengaturan-platform.html # Kerangka HTML pengaturan platform
│   ├── css/pages/              # File styling khusus per halaman partial
│   ├── js/vendor/              # Salinan fisik pustaka pihak ketiga self-host
│   ├── 404.html                # Halaman kesalahan rute kustom
│   ├── manifest.json           # Manifest Progressive Web Apps (PWA)
│   ├── sw.js                   # Service Worker (offline cache)
│   ├── robots.txt              # Aturan crawler mesin pencari
│   └── sitemap.xml             # Sitemap publik untuk SEO
│
├── api/                        # Vercel Serverless Functions
│   ├── chatbot.js              # Proxy Gemini AI dengan verifikasi JWT
│   ├── create-user.js          # Endpoint pembuatan akun dengan service_role
│   └── delete-orphan.js        # Pembersih akun OAuth yang belum terdaftar
│
├── assets/                     # Media grafis, logo SVG baru, & screenshot
├── supabase_schema.sql         # Skema basis data PostgreSQL lengkap
├── vite.config.js              # Konfigurasi Vite & proxy dev lokal
└── vercel.json                 # Konfigurasi rewrite & HTTP Security Headers
```

---

## ⚡ Panduan Instalasi & Menjalankan Proyek

### 1. Prasyarat Sistem
* Perangkat terpasang [Node.js](https://nodejs.org) versi 18.0.0 atau lebih baru.
* Git terpasang di komputer Anda.

### 2. Langkah Menjalankan Secara Cepat (Local Development)

```bash
# 1. Clone repositori ke komputer Anda
git clone https://github.com/BangkitTheGreat/Ledgerly.git

# 2. Masuk ke direktori proyek
cd Ledgerly

# 3. Pasang dependensi pengembangan (Vite)
npm install

# 4. Siapkan file konfigurasi lingkungan (.env)
cp .env.example .env

# 5. Jalankan server pengembangan Vite
npm run dev
```

Browser Anda akan terbuka secara otomatis pada alamat:
👉 `http://localhost:5173/`

> [!TIP]
> **Ingin mencoba langsung tanpa ribet menyiapkan database?**
> Cukup buka `http://localhost:5173/` lalu klik tombol **"Coba Demo"** di halaman utama atau halaman login. Anda dapat langsung menjelajahi seluruh fitur dasbor tanpa perlu registrasi atau koneksi Supabase!

### 3. Konfigurasi Variabel Lingkungan (`.env`)

Jika ingin menghubungkan ke database Supabase dan integrasi AI milik Anda sendiri, sesuaikan isi file `.env`:

```env
# Kredensial Publik Supabase (Aman diakses client)
VITE_SUPABASE_URL=https://proyek-anda.supabase.co
VITE_SUPABASE_ANON_KEY=kunci-anon-supabase-anda

# Kunci API Google Gemini (AI Chatbot)
VITE_GEMINI_API_KEY=kunci-api-gemini-anda

# Cloudflare Turnstile CAPTCHA (Opsional di lokal)
VITE_TURNSTILE_SITE_KEY=turnstile-site-key-anda
SUPABASE_TURNSTILE_SECRET_KEY=turnstile-secret-key-anda

# Service Role Key (HANYA untuk endpoint server /api/create-user)
SUPABASE_SERVICE_ROLE_KEY=kunci-service-role-rahasia

# Konfigurasi Integrasi WhatsApp Gateway (Opsional)
VITE_WHATSAPP_API_URL=https://domain-pterodactyl-bot-wa-anda
VITE_WHATSAPP_TOKEN=token-rahasia-bot-wa
OWNER_NUMBER=628xxxxxxxxxx
OWNER_LID=nomor-lid-wa
```

### 4. Menyiapkan Database Supabase Mandiri
1. Buat proyek baru di [Supabase Dashboard](https://supabase.com).
2. Buka menu **SQL Editor**.
3. Buka berkas [`supabase_schema.sql`](supabase_schema.sql) dari repositori ini, salin seluruh kodenya, lalu tempel dan klik **Run**.
4. Seluruh tabel, fungsi RLS, dan trigger akan dibuat secara otomatis.

---

## 🔒 Standar Keamanan & Proteksi Data (OWASP Top 10)

Ledgerly mengedepankan keamanan data bisnis dengan menerapkan arsitektur *defense-in-depth*:

1. **Row-Level Security (RLS)**: Setiap baris pada tabel Supabase diisolasi menggunakan klausa `auth.uid() = user_id`. Pengguna toko A mustahil membaca atau mengubah data toko B.
2. **Kunci Rahasia Terisolasi (No Leakage)**: `SUPABASE_SERVICE_ROLE_KEY` dan `VITE_GEMINI_API_KEY` tidak pernah terekspos ke klien. Panggilan AI dan manajemen pengguna dialirkan melalui proxy serverless di `/api/` yang memverifikasi JWT autentikasi.
3. **Pembersihan XSS Menyeluruh**: Seluruh masukan pengguna disanitasi menggunakan fungsi `escapeHtml()` dan `escapeAttr()` pada [`js/utils.js`](js/utils.js) sebelum dicetak ke DOM.
4. **Content Security Policy (CSP) Ketat**: Diatur melalui [`vercel.json`](vercel.json) dengan pembatasan `script-src 'self'`. Tidak ada pemuatan berkas executable dari CDN pihak ketiga yang tidak tepercaya.
5. **Autentikasi Gated OAuth Google**: Login pihak ketiga menggunakan Google OAuth 2.0 dikunci (*gated*) hanya bagi email yang telah terdaftar di database. Akun OAuth tidak dikenal akan otomatis dihapus lewat `/api/delete-orphan`.
6. **Proteksi Anti-Bot**: Formulir login dan pendaftaran dilindungi oleh Cloudflare Turnstile CAPTCHA untuk menangkal serangan *credential stuffing* dan *brute force*.

---

## 📈 Hasil Audit Kualitas & Performa Web

Diuji pada lingkungan produksi menggunakan **Google PageSpeed Insights (Lighthouse)** dan **Mozilla HTTP Observatory**:

### Google PageSpeed Insights (Lighthouse)
| Metrik | Skor Mobile | Skor Desktop | Status |
| :--- | :---: | :---: | :---: |
| ⚡ **Performance** | **93** / 100 | **99** / 100 | Sangat Cepat |
| ♿ **Accessibility** | **100** / 100 | **100** / 100 | Sempurna |
| ✅ **Best Practices** | **92** / 100 | **92** / 100 | Optimal |
| 🔍 **SEO** | **100** / 100 | **100** / 100 | Sempurna |

### Mozilla HTTP Observatory
* Skor Keamanan Header: **B+ (80/100)** — Dilengkapi implementasi HSTS, Content Security Policy, X-Frame-Options (anti-clickjacking), X-Content-Type-Options (anti-MIME sniffing), dan Referrer-Policy yang ketat.

---

## 📜 Riwayat Evolusi Commit (Changelog Perjalanan Proyek)

Perjalanan pengembangan Ledgerly terbagi menjadi empat fase utama:

### 🔹 Fase 1: Fondasi Awal & Kerangka Sistem (Tim TP-G007)
* Inisialisasi struktur MPA dengan Vite (`5bbc701`).
* Desain kerangka awal autentikasi, dasbor inventaris, transaksi, dan keuangan (`9569a63` - `de8637b`).
* Inisialisasi klien Supabase dan state management global (`0b4a53c`).

### 🔹 Fase 2: Pengembangan Fitur Inti & Integrasi Eksternal
* Implementasi floating chat AI panel (FAB) dengan Google Gemini API & Web Speech API (`9bb90d3`, `e949d29`).
* Integrasi dropzone PapaParse untuk impor CSV massal dan ekspor PDF via jsPDF (`6690594`, `0291f43`).
* Algoritma Sistem Pendukung Keputusan (DSS) untuk rekomendasi restock persediaan (`68b8bde`).
* Integrasi pengiriman peringatan stok menipis via WhatsApp Gateway (`03cf967`, `110b081`).

### 🔹 Fase 3: Hardening Keamanan, PWA, & Superadmin
* Pembuatan panel kontrol Superadmin untuk mengelola kuota toko dan paket langganan (`5376020`).
* Ekspor buku kas Excel berformula dinamis menggunakan ExcelJS (`84d5425`).
* Integrasi pemindai barcode kamera HP (`8bb52b6`) dan generator QR code produk (`320a560`).
* PWA Offline ready via Service Worker (`fa7649f`).
* Migrasi dari CDN publik ke pustaka **self-hosted penuh** di `public/js/vendor/` (`012a679`, `97bb1d3`, `a0f0f1c`).
* Integrasi Cloudflare Turnstile CAPTCHA dan login ber-gate Google OAuth (`2d336ef`, `06d9202`).
* Baseline komitmen tim stabil pada repositori induk [`Kyrozu/Ledgerly:main`](https://github.com/Kyrozu/Ledgerly/tree/main) (`766fbfd`).

### 🔹 Fase 4: Peningkatan Tampilan (UI yang Ditingkatkan), Fitur Baru, & Demo Mode *(Enhanced by Bangkit)*
* **Pindah Konfigurasi Supabase Mandiri**: Penyediaan skema SQL terstruktur idempotent di [`supabase_schema.sql`](supabase_schema.sql) (`11d3b63`).
* **Redesain Antarmuka (UI yang Ditingkatkan)**: Transformasi visual landing page dengan aurora mesh background, kartu bento grid, dan interaksi dinamis (`72588c2`).
* **Mode "Coba Demo" (Offline / Zero Backend)**: Emulasi database in-memory berbasis sessionStorage di [`js/demo.js`](js/demo.js) sehingga siapa pun dapat langsung mencoba aplikasi tanpa registrasi (`52502a8`).
* **Halaman Konfirmasi Email**: Penambahan [`konfirmasi.html`](konfirmasi.html) untuk alur onboarding pendaftaran akun (`11d3b63`).
* **Halaman Beranda Baru (Store Overview)**: Desain kartu hero, gauge performa, dan sparkline grafik 14 hari di [`js/pages/beranda.js`](js/pages/beranda.js) (`d325c52`).
* **Halaman Akun Baru**: Pusat informasi profil dan rincian identitas toko di [`js/pages/akun.js`](js/pages/akun.js) (`e92916e`).
* **Desain Shell Dasbor Capstone**: Kanvas berbingkai (*framed canvas*) dengan panel melengkung dan topbar terintegrasi (`67dd8e9`, `682c0a9`).
* **Identitas Visual Baru**: Desain logo resmi SVG baru di [`assets/logo.svg`](assets/logo.svg) yang memadukan simbol panel dasbor, donut chart, grafik tren naik, dan batang persediaan (`0816e70`).

---

## 🗺️ Rencana Pengembangan Mendatang (Roadmap)

* [ ] **Integrasi Payment Gateway Otomatis**: Dukungan pembayaran langganan otomatis melalui Midtrans/Xendit (QRIS, VA Bank, E-Wallet).
* [ ] **Multi-Cabang & Multi-Kasir (Role Kasir)**: Akses terbatas khusus staf kasir untuk mencatat transaksi tanpa melihat data margin modal.
* [ ] **Kirim Faktur Penjualan via WhatsApp**: Otomatisasi pengiriman bukti transaksi atau struk belanja ke nomor WhatsApp pelanggan.
* [ ] **Verifikasi OTP WhatsApp**: Penggantian verifikasi email konfirmasi dengan kode OTP instan melalui bot WhatsApp terintegrasi.

---

## 📄 Lisensi & Hak Cipta

Proyek ini dikembangkan untuk tujuan edukasi dan pemberdayaan UMKM.

* **Repositori Induk**: [Kyrozu/Ledgerly](https://github.com/Kyrozu/Ledgerly) (Tim TP-G007 Dicoding Capstone 2026)
* **Pengembang Versi Ini**: [Bangkit Agung Nugroho](https://github.com/BangkitTheGreat)
* Seluruh hak cipta terdaftar di bawah lisensi dan pedoman program Dicoding Capstone Project 2026.
