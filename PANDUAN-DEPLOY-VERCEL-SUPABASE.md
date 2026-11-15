# 🚀 Panduan Lengkap Deploy CNC Database ke Internet (100% GRATIS)

Aplikasi **CNC Database Galangan Kapal** kini telah berhasil direfaktor menjadi arsitektur modern **Nuxt 3 + Supabase (PostgreSQL) + Vercel Edge Hosting**. 

Kombinasi ini memberikan keuntungan:
- **100% GRATIS Selamanya** (tanpa kartu kredit / biaya bulanan).
- **Akses Publik Global**: Bisa dibuka langsung dari HP Android/iPhone, tablet rigger, maupun laptop kantor di mana pun berada.
- **Dual Mode Storage**: Aplikasi langsung dapat berjalan secara lokal / preview (menggunakan localStorage pintar) dan otomatis tersinkronisasi ke PostgreSQL Supabase ketika kredensial dipasang.
- **Role-Based Access Control (RBAC)**:
  - `admin@gmail.com` (password: `123`) &rarr; Akses Penuh + Manajemen User + Reset Database ke Nol
  - `mandor@gmail.com` (password: `123`) &rarr; Akses Operasional Lengkap (Dashboard, Order, Estimasi, Yard, Operator, Verifikasi PIN, History)
  - `user@gmail.com` (password: `123`) &rarr; **Terkunci Khusus 3 Menu**: Buat Order Pekerjaan, Daftar Order Plat, dan Pengambilan Plat (Vault PIN). Tidak dapat mengakses menu Admin maupun Mandor!
- **Auto Light & Dark Mode**: Beralih tema otomatis atau manual, tersimpan secara persisten.

---

## 🛠️ Langkah 1: Setup Database PostgreSQL di Supabase (Gratis)

1. Buka [https://supabase.com](https://supabase.com) lalu klik **Start your project** (login dengan akun GitHub atau Google).
2. Klik **New Project**, pilih nama misalnya: `cnc-database`, masukkan password database, dan pilih region terdekat (misalnya: `Singapore`).
3. Setelah project selesai dibuat (sekitar 1-2 menit):
   - Masuk ke menu **SQL Editor** di sidebar kiri.
   - Buka file `supabase/schema.sql` yang ada di folder project ini.
   - Salin (copy) seluruh isi file `supabase/schema.sql`, lalu tempel (paste) ke SQL Editor Supabase.
   - Klik tombol **Run** (Ctrl + Enter).
   - *Semua tabel (`profiles`, `plates`, `orders`, `order_estimations`, `yard_pickups`), RLS policies, dan akun default (`admin@gmail.com`, `mandor@gmail.com`, `user@gmail.com`) langsung siap digunakan!*
4. Dapatkan Kredensial API:
   - Masuk ke menu **Project Settings** (ikon gear di pojok kiri bawah) &rarr; **API**.
   - Salin nilai **Project URL** (contoh: `https://xyzcompany.supabase.co`).
   - Salin nilai **Project API Keys** bagian `anon` / `public`.

---

## ☁️ Langkah 2: Deploy ke Vercel (100% Gratis & Instant)

### Opsi A: Melalui GitHub (Rekomendasi Terbaik & Auto Update)

1. Buat repository baru di akun GitHub Anda (misalnya: `cnc-database`).
2. Di terminal folder ini (`c:\Users\dendi aprilio\.gemini\antigravity-ide\scratch\cnc-database`), jalankan perintah git:
   ```bash
   git init
   git add .
   git commit -m "feat: Nuxt 3 CNC Database with Supabase & Vercel"
   git branch -M main
   git remote add origin https://github.com/USERNAME-ANDA/cnc-database.git
   git push -u origin main
   ```
3. Buka [https://vercel.com](https://vercel.com) lalu login dengan akun GitHub Anda.
4. Klik **Add New...** &rarr; **Project**, lalu pilih repository `cnc-database` yang baru Anda push.
5. Pada bagian **Environment Variables**, tambahkan 2 variabel berikut:
   - `SUPABASE_URL` = *(Tempel URL Supabase dari Langkah 1)*
   - `SUPABASE_KEY` = *(Tempel anon key Supabase dari Langkah 1)*
6. Klik tombol **Deploy**!
7. Dalam waktu ~1 menit, website Anda sudah aktif dan live dengan domain HTTPS gratis (contoh: `https://cnc-database-xyz.vercel.app`).

---

### Opsi B: Deploy Langsung via Vercel CLI (Tanpa Git)

Jika tidak ingin membuat repo GitHub terlebih dahulu:
1. Buka PowerShell / terminal di folder ini:
   ```bash
   npx vercel
   ```
2. Ikuti panduan di layar (pilih default).
3. Tambahkan environment variable saat deploy atau di dashboard Vercel:
   ```bash
   npx vercel env add SUPABASE_URL
   npx vercel env add SUPABASE_KEY
   npx vercel --prod
   ```

---

## 🔑 Akun & Kredensial Login Bawaan

| Role Pengguna | Email Login | Username | Password | Hak Akses Fitur |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin@gmail.com` | `admin` | `123` | **Full Akses**: Dashboard, Order, Estimasi, Yard, Operator, Verifikasi, History, Kelola User & Reset Nol |
| **Mandor** | `mandor@gmail.com` | `mandor` | `123` | **Full Operasional**: Dashboard, Order, Estimasi Plat, Stok Yard, Ambil Yard, Operator CNC, Verifikasi PIN, History |
| **User (Pemesan)** | `user@gmail.com` | `user` | `123` | **Terkunci Khusus 3 Menu**: Buat Order Baru, Daftar Order Saya, dan Pengambilan Plat (Vault PIN) |

---

## 📱 Mengakses dari HP / Teman-teman di Lapangan

Karena sudah di-deploy ke Vercel:
1. Bagikan link website Vercel Anda (misalnya `https://cnc-database-xyz.vercel.app`) ke grup WhatsApp tim lapangan/galangan.
2. Teman Anda bisa langsung membukanya di browser HP (Chrome, Safari) **tanpa perlu berada di satu jaringan Wi-Fi yang sama**.
3. Website sudah sepenuhnya **responsif mobile**:
   - Sidebar navigasi otomatis menjadi drawer hamburger yang ramping di HP.
   - Tabel responsif scroll horizontal.
   - PIN Vault berukuran besar dan mudah dibaca di layar smartphone operator workshop.
   - Pilihan mode gelap (Dark Mode) yang nyaman untuk mata di area galangan malam hari.

---

## 🗄️ Backup Proyek Laravel Sebelumnya
Proyek Laravel 13 + MySQL sebelumnya tetap tersimpan utuh dan aman tanpa ada data yang hilang di folder:
`c:\Users\dendi aprilio\.gemini\antigravity-ide\scratch\cnc-database-laravel`

