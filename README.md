# 🌱 Jurnal Tanam

Aplikasi web untuk mencatat dan melacak semua aktivitas budidaya tanaman dengan mudah. Didesain khusus untuk petani, penghobi berkebun, dan pelaku agribisnis yang ingin mengelola kebun mereka secara digital.

## ✨ Fitur Utama

### 📊 Manajemen Lahan
- Kelola berbagai lahan/tempat penanaman
- Data lahan: nama, lokasi, luas, satuan (m²/ha), catatan
- Navigasi cepat dari dashboard

### 🌱 Manajemen Tanaman
- Catat data tanaman lengkap
- Kategori: Sayur, Buah, Hias, Karnivora, Lainnya
- Status pertumbuhan: Semai, Tumbuh, Berbunga, Berbuah, Panen, Gagal
- Data: nama, jenis, varietas, tanggal tanam, jumlah, catatan

### 📝 Pencatatan Aktivitas
Aktivitas yang dapat dicatat:
- **💩 Pemupukan** - dengan detail produk, dosis, volume
- **🧪 Penyemprotan Fungisida** - proteksi jamur
- **🦟 Penyemprotan Insektisida** - proteksi serangga
- **💧 Penyiraman** - jadwal dan metode penyiraman
- **✂️ Pangkas** - perawatan pruning
- **🔬 Okulasi** - teknik pembiakan
- **🌱 Semai** - pembibitan
- **🐛 Catatan Hama & Penyakit** - dengan tingkat serangan (Ringan/Sedang/Berat)
- **🌾 Panen** - jumlah, satuan, kualitas hasil
- **📝 Aktivitas Lainnya** - fleksibel untuk kebutuhan khusus

**Fitur Cara Aplikasi:**
- Pilihan metode: Kocor, Spray, atau Lainnya
- Jika pilih "Lainnya", muncul field custom untuk metode spesifik

### 📈 Dashboard Interaktif
- **Statistik Real-time**: Total lahan, tanaman, aktivitas, tanaman aktif
- **Aktivitas Terbaru**: 5 aktivitas terakhir dengan format "[Jenis Aktivitas] [Nama Tanaman]"
- **Status Tanaman**: Breakdown jumlah tanaman per status
- **Semua dapat diklik** - navigasi langsung ke halaman terkait
- **Detail Aktivitas**: Klik aktivitas untuk melihat detail lengkap dalam modal

### 🔐 Autentikasi Aman
- Login dengan Google OAuth
- Popup untuk development (localhost)
- Redirect untuk production
- Tidak perlu password manual

### 📱 Mobile-Friendly
- Responsive design untuk HP
- Bottom navigation untuk mobile
- Sidebar untuk desktop
- Optimized untuk penggunaan di lapangan

### 💾 Penyimpanan Cloud
- Data tersimpan di Firebase Firestore
- Akses dari mana saja
- Real-time updates
- Data aman dan ter-backup

## 🚀 Cara Install & Menjalankan

### Prasyarat
- Node.js (versi 18 atau lebih tinggi)
- npm atau yarn
- Akun Firebase

### 1. Clone Repository

```bash
git clone <repository-url>
cd JurnalTanam
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Firebase

#### A. Buat Project Firebase
1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Klik "Add Project" dan ikuti langkah-langkahnya
3. Aktifkan **Authentication** dan **Firestore Database**

#### B. Aktifkan Google Authentication
1. Di Firebase Console, pilih **Authentication** → **Sign-in method**
2. Aktifkan **Google** provider
3. Tambahkan authorized domains:
   - `localhost` (untuk development)
   - Domain production Anda (contoh: `your-app.vercel.app`)

#### C. Setup Firestore Database
1. Pilih **Firestore Database** → **Create Database**
2. Pilih mode **Start in test mode** (untuk development)
3. Pilih lokasi server terdekat

#### D. Copy Konfigurasi Firebase
1. Pilih **Project Settings** (ikon gear) → **General**
2. Di bagian "Your apps", pilih web (</>)
3. Copy konfigurasi Firebase

### 4. Setup Environment Variables

```bash
cp .env.example .env
```

Edit file `.env` dan isi dengan konfigurasi Firebase Anda:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123def456
```

**Catatan**: File `.env` tidak akan di-commit ke GitHub karena sudah ada di `.gitignore`.

### 5. Jalankan Aplikasi (Development)

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173`

### 6. Build untuk Production

```bash
npm run build
```

File hasil build akan ada di folder `dist/`.

## 🌐 Deploy ke Vercel

### 1. Push ke GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/jurnal-tanam.git
git push -u origin main
```

### 2. Deploy ke Vercel

1. Login ke [Vercel](https://vercel.com)
2. Klik **"Add New Project"**
3. Import repository GitHub Anda
4. Pada bagian **Environment Variables**, tambahkan semua variabel dari `.env`:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
5. Klik **"Deploy"**

### 3. Update Firebase Authorized Domains

Setelah deploy, tambahkan domain Vercel ke Firebase:
1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Pergi ke **Authentication** → **Settings** → **Authorized Domains**
3. Tambahkan domain Vercel Anda (contoh: `jurnal-tanam.vercel.app`)

## 📖 Cara Penggunaan

### 1. Login Pertama Kali
- Buka aplikasi
- Klik "Login dengan Google"
- Pilih akun Google Anda
- Selesai! Anda masuk ke Dashboard

### 2. Tambah Lahan
1. Klik menu **Lahan** atau card Total Lahan di Dashboard
2. Klik **"Tambah Lahan"**
3. Isi nama, lokasi, luas (opsional), dan catatan
4. Klik **"Tambah Lahan"**

### 3. Tambah Tanaman
1. Klik menu **Tanaman** atau card Total Tanaman di Dashboard
2. Klik **"Tambah Tanaman"**
3. Pilih lahan tempat menanam
4. Isi data tanaman (nama, jenis, varietas, dll)
5. Pilih status awal (biasanya "Semai")
6. Klik **"Tambah Tanaman"**

### 4. Catat Aktivitas
1. Klik menu **Aktivitas** atau card Total Aktivitas di Dashboard
2. Klik **"Tambah Aktivitas"**
3. Pilih jenis aktivitas (contoh: Pemupukan)
4. Pilih lahan dan tanaman
5. Pilih tanggal aktivitas
6. Isi detail sesuai jenis aktivitas:
   - **Pemupukan**: Nama produk, dosis, volume, cara aplikasi
   - **Hama/Penyakit**: Gejala, tingkat serangan, tindakan
   - **Panen**: Jumlah, satuan, kualitas
7. Tambahkan biaya (opsional) dan catatan
8. Klik **"Simpan Aktivitas"**

### 5. Lihat Dashboard
- Lihat statistik ringkasan
- Klik aktivitas terbaru untuk detail
- Klik status tanaman untuk filter

### 6. Edit/Hapus Data
- Setiap item (lahan, tanaman, aktivitas) memiliki tombol edit (✏️) dan hapus (🗑️)
- Klik tombol tersebut untuk mengubah atau menghapus data

## 🛠️ Teknologi yang Digunakan

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: CSS Native (Responsive & Mobile-first)
- **Routing**: React Router DOM
- **Authentication**: Firebase Authentication (Google OAuth)
- **Database**: Firebase Firestore (NoSQL)
- **Storage**: Firebase Storage (untuk fitur upload foto di masa depan)

## 📝 Struktur Database Firestore

### Collection: `users`
```typescript
{
  googleId: string
  nama: string
  email: string
  foto?: string
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Collection: `lahan`
```typescript
{
  userId: string
  nama: string
  lokasi: string
  luas?: number
  satuan?: 'm2' | 'ha'
  catatan?: string
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Collection: `tanaman`
```typescript
{
  lahanId: string
  userId: string
  nama: string
  jenis: string  // Sayur, Buah, Hias, Karnivora, Lainnya
  varietas?: string
  tanggalTanam: timestamp
  status: 'semai' | 'tumbuh' | 'berbunga' | 'berbuah' | 'panen' | 'gagal'
  jumlah: number
  foto?: string
  catatan?: string
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Collection: `aktivitas`
```typescript
{
  tanamanId: string
  lahanId: string
  userId: string
  jenis: 'pemupukan' | 'penyemprotan_fungisida' | 'penyemprotan_insektisida' | 
         'penyiraman' | 'pangkas' | 'okulasi' | 'semai' | 'hama_penyakit' | 
         'panen' | 'lainnya'
  tanggal: timestamp
  detail: {
    namaProduk?: string
    dosis?: string
    volume?: string
    caraAplikasi?: string  // Kocor, Spray, atau custom
    hasil?: string
    gejala?: string
    tingkatSerangan?: 'ringan' | 'sedang' | 'berat'
    tindakan?: string
    jumlahPanen?: number
    satuanPanen?: string
    kualitas?: 'baik' | 'sedang' | 'buruk'
  }
  biaya?: number
  foto?: string[]
  cuaca?: 'cerah' | 'berawan' | 'hujan' | 'hujan_der' | 'mendung'
  catatan?: string
  createdAt: timestamp
  updatedAt: timestamp
}
```

## 🧪 Development Scripts

```bash
# Jalankan development server
npm run dev

# Build untuk production
npm run build

# Preview build production
npm run preview

# Run linter
npm run lint
```

## 🤝 Kontribusi

Kontribusi sangat diterima! Silakan:
1. Fork repository ini
2. Buat branch fitur (`git checkout -b fitur-baru`)
3. Commit perubahan (`git commit -am 'Tambah fitur baru'`)
4. Push ke branch (`git push origin fitur-baru`)
5. Buat Pull Request

## 📄 Lisensi

[MIT License](LICENSE)

---

**Dibuat dengan ❤️ untuk para petani Indonesia**

Jika ada pertanyaan atau masalah, silakan buat [Issue](https://github.com/username/jurnal-tanam/issues) baru.
