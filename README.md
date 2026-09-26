# 🏜️ CLASS 8G QUIZ

Website quiz online bertema **Desert Night** untuk event kelas 8G. 10 soal logika VERY HARD,
timer per soal, anti-cheat browser, leaderboard real-time, dan dashboard admin — semuanya
dalam **1 project** yang di-deploy ke **Vercel**, dengan **Supabase** sebagai database.

---

## Arsitektur singkat

- **Frontend**: HTML/CSS/JS polos (`public/`) — tidak butuh build step.
- **Backend**: Vercel Serverless Functions (`api/`) — tidak butuh server/VPS.
- **Database**: Supabase Postgres, diakses HANYA lewat serverless function dengan
  `SUPABASE_SERVICE_ROLE_KEY` (key ini tidak pernah dikirim ke browser).
- Jawaban benar (answer key) 10 soal disimpan di `api/_data/questions.js`
  (server-only). Halaman `/quiz` hanya menerima teks soal + pilihan lewat
  `GET /api/questions`, tanpa jawaban benar. Skor dihitung ulang di server saat
  submit — client tidak pernah dipercaya untuk mengirim skor sendiri.

### Batasan penting (harus jujur soal ini)

Sistem anti-cheat di browser **tidak bisa mencegah semua bentuk kecurangan** — ia
hanya mendeteksi perilaku yang bisa diamati browser (pindah tab, blur, copy/paste,
klik kanan, percobaan shortcut devtools, keluar fullscreen, reload). Pengguna yang
sangat paham teknis tetap bisa mengakalinya. Anggap ini sebagai pencegah untuk
kelas, bukan sistem proctoring yang benar-benar aman.

---

## Struktur file

```text
class-8g-quiz/
├── package.json
├── vercel.json
├── README.md          (file ini)
├── .env.example
├── public/
│   ├── index.html      Landing page (isi nickname)
│   ├── quiz.html        Halaman quiz + timer + anti-cheat
│   ├── result.html      Hasil setelah submit
│   ├── leaderboard.html Leaderboard publik (polling tiap 8 detik)
│   ├── admin.html       Dashboard admin (perlu Admin Key)
│   ├── style.css        Tema Desert Night
│   ├── app.js            \_ logic index.html
│   ├── quiz.js            \_ logic quiz.html
│   ├── result.js          \_ logic result.html
│   ├── leaderboard.js     \_ logic leaderboard.html
│   └── admin.js           \_ logic admin.html
├── api/
│   ├── questions.js     GET  — kirim soal TANPA jawaban benar
│   ├── submit.js        POST — validasi & hitung ulang skor di server
│   ├── leaderboard.js   GET  — hanya submission clean=true
│   ├── admin.js         GET  — perlu Admin Key, semua submission
│   ├── _data/questions.js  Answer key asli (server-only)
│   └── _lib/supabase.js    Helper koneksi Supabase (service role)
└── supabase.sql        Schema database + RLS
```

---

## TUTORIAL DEPLOY DARI NOL

Tutorial ini ditulis untuk pemula. Ikuti urut dari atas ke bawah.

### 1. Membuat project Supabase

1. Buka https://supabase.com dan login/daftar (bisa pakai akun GitHub).
2. Klik **New Project**.
3. Isi nama project (misal `class-8g-quiz`), buat password database (simpan baik-baik,
   tidak akan dipakai di kode kita tapi Supabase tetap memintanya), pilih region
   terdekat (misal Singapore), lalu klik **Create new project**.
4. Tunggu 1–2 menit sampai project selesai dibuat (statusnya jadi hijau/"Active").

### 2. Menjalankan `supabase.sql`

1. Di dashboard Supabase project kamu, buka menu **SQL Editor** di sidebar kiri.
2. Klik **New query**.
3. Buka file `supabase.sql` dari project ini, salin **seluruh isinya**, lalu tempel
   ke SQL Editor.
4. Klik **Run** (atau tombol ▶). Pastikan muncul pesan sukses, tanpa error merah.
5. Cek hasilnya: buka menu **Table Editor** di sidebar, harus ada tabel `submissions`.

### 3. Mengambil SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY

1. Di dashboard Supabase, buka **Project Settings** (ikon gear) → **API**.
2. Salin nilai **Project URL** → ini adalah `SUPABASE_URL`.
3. Di bagian **Project API keys**, salin nilai **service_role** (bukan `anon`/`public`!)
   → ini adalah `SUPABASE_SERVICE_ROLE_KEY`. Simpan sementara, jangan dibagikan ke
   siapa pun.

### 4. Membuat GitHub repository

1. Buka https://github.com, login, lalu klik tombol **New** (repository baru).
2. Beri nama misal `class-8g-quiz`, pilih **Private** (disarankan, karena ada soal
   quiz di dalamnya), lalu klik **Create repository**.
3. Jangan centang "Add a README" (kita sudah punya sendiri).

### 5. Upload project ke GitHub

Cara termudah untuk pemula — lewat browser, tanpa command line:

1. Di halaman repository yang baru dibuat, klik **uploading an existing file**
   (atau tombol **Add file → Upload files**).
2. Seret (drag & drop) seluruh folder/file project `class-8g-quiz` ke area upload
   tersebut (pastikan struktur folder `public/` dan `api/` ikut terupload apa
   adanya).
3. Scroll ke bawah, klik **Commit changes**.

*(Alternatif jika sudah biasa pakai terminal: `git init`, `git add .`,
`git commit -m "init"`, `git remote add origin <url-repo>`, `git push -u origin main`.)*

### 6. Import project ke Vercel

1. Buka https://vercel.com, login (disarankan pakai akun GitHub yang sama).
2. Klik **Add New... → Project**.
3. Pilih repository `class-8g-quiz` yang baru dibuat, klik **Import**.
4. Di layar konfigurasi, biarkan pengaturan default (Vercel akan otomatis
   mengenali `vercel.json`). Jangan klik Deploy dulu — isi Environment Variables
   dulu di langkah berikutnya.

### 7. Memasukkan Environment Variables

Masih di layar konfigurasi import (atau nanti bisa juga lewat
**Project → Settings → Environment Variables** setelah project dibuat):

1. Tambahkan variable satu per satu:
   - `SUPABASE_URL` → isi dengan Project URL dari langkah 3.
   - `SUPABASE_SERVICE_ROLE_KEY` → isi dengan service_role key dari langkah 3.
   - `ADMIN_KEY` → buat password bebas untuk masuk ke halaman `/admin`, misal
     `raka-admin-2026!`.
2. Pastikan ketiganya diaktifkan untuk environment **Production**, **Preview**,
   dan **Development** (biasanya default sudah semua tercentang).
3. Klik **Save** untuk masing-masing variable.

### 8. Deploy

1. Klik tombol **Deploy**.
2. Tunggu proses build selesai (biasanya 30–60 detik).
3. Setelah selesai, akan muncul halaman "Congratulations" dengan preview website.

### 9. Mendapatkan link quiz

1. Setelah deploy sukses, Vercel akan memberi domain otomatis seperti
   `https://class-8g-quiz.vercel.app` — ini yang dibagikan ke teman sekelas.
2. Bisa dicek/disalin lagi kapan saja lewat dashboard project → tab **Domains**.
3. (Opsional) Kamu bisa menambahkan custom domain sendiri di tab yang sama.

### 10. Membuka `/admin`

1. Buka `https://<domain-kamu>.vercel.app/admin`.
2. Masukkan `ADMIN_KEY` yang kamu set di langkah 7, klik **MASUK**.
3. Dashboard akan menampilkan semua submission (termasuk yang disqualified),
   lengkap dengan alasan pelanggaran.

### 11. Mengganti password admin

1. Buka project di Vercel → **Settings → Environment Variables**.
2. Cari `ADMIN_KEY`, klik **Edit**, ganti nilainya, **Save**.
3. Buka tab **Deployments**, klik deployment terbaru → menu **...** → **Redeploy**
   (environment variable baru baru aktif setelah redeploy).

### 12. Mengganti soal quiz

1. Buka file `api/_data/questions.js` di GitHub (atau di komputer lalu upload ulang).
2. Edit teks `question`, `options` (harus tetap 4 pilihan), dan `correctIndex`
   (0 = A, 1 = B, 2 = C, 3 = D) untuk soal yang ingin diganti.
3. Simpan (commit) perubahan di GitHub — Vercel akan otomatis redeploy karena
   terhubung ke repository ini (auto-deploy on push).
4. Jangan mengubah file di `public/` untuk urusan soal — soal HARUS selalu lewat
   `api/_data/questions.js` supaya jawaban benar tidak pernah terkirim ke browser
   sebelum quiz selesai.

### 13. Mengganti nama/hadiah/tema event

- Nama website & subjudul: edit teks di dalam tag `<h1>` dan `<div class="subtitle">`
  pada `public/index.html` (dan judul serupa di halaman lain bila perlu).
- Warna tema desert (dark brown/sand/gold/orange): edit variabel warna di bagian
  paling atas file `public/style.css` (`:root { --sand: ...; --gold: ...; }` dst).
- Timer per soal (default 45 detik): ubah `TIME_PER_QUESTION` di `api/questions.js`
  **dan** `api/submit.js` (harus sama nilainya di kedua file).
- Setelah edit, commit & push ke GitHub — Vercel redeploy otomatis.

---

## Ringkasan sistem skor

- Jawaban benar: **+100 poin**.
- Bonus kecepatan: `max(0, total_waktu_maksimal − waktu_pengerjaan)` detik,
  ditambahkan ke skor (total waktu maksimal = 10 soal × 45 detik = 450 detik).
- Jika ada pelanggaran: submission tetap tersimpan (untuk dilihat admin), tapi:
  - **1 pelanggaran** → status `FLAGGED`, skor tetap dihitung tapi **tidak** tampil
    di leaderboard.
  - **2 pelanggaran** → quiz langsung dihentikan, status `DISQUALIFIED`, skor
    dipaksa jadi **0**.
- Leaderboard hanya menampilkan submission dengan status `CLEAN` (0 pelanggaran),
  diurutkan berdasarkan skor tertinggi, lalu waktu tercepat sebagai tie-breaker.

Selamat menjalankan event kuisnya! 🏆
