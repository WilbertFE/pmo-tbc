# PMO TBC — Pendamping Digital Pengawas Menelan Obat TBC

> Nama aplikasi masih sementara. Dibuat untuk Hackathon JOINTS UGM 2026, tema **Healthcare**.

Sistem pemantauan minum obat TBC dua arah: **pasien dan PMO** melakukan check-in harian dengan video atau foto, sementara **nakes puskesmas** memantau, memverifikasi, dan menindaklanjuti pasien yang berisiko putus obat lewat dashboard real-time.

**Demo:** https://pmo-tbc.vercel.app/ · **Video:** _(isi link YouTube)_ · **Pitch deck:** _(isi link)_

---

## Masalah

- Indonesia menempati posisi kedua beban kasus TBC tertinggi di dunia setelah India.
- Pengobatan TBC berlangsung sekitar 6 bulan setiap hari. Jika pasien berhenti di tengah jalan, pengobatan bisa harus diulang dari awal dan bakteri berisiko menjadi kebal obat.
- Peran PMO (biasanya anggota keluarga) terbukti berhubungan dengan kepatuhan minum obat, tetapi pengawasannya masih manual dan nakes sulit memantau banyak pasien setiap hari.

## Solusi

Aplikasi ini bukan sekadar pengingat minum obat. Ini sistem pemantauan:

1. **Check-in harian** — pasien/PMO merekam video atau foto saat minum obat, dan bisa melaporkan efek samping dengan beberapa ketukan.
2. **Dashboard nakes** — nakes melihat status semua pasiennya hari ini, meninjau video check-in, dan mendapat peringatan dini untuk pasien berisiko putus obat.
3. **Pengingat dan eskalasi** — pasien diingatkan pada jam minum obat; jika tetap tidak check-in, nakes mendapat notifikasi untuk menindaklanjuti.

Pendekatan ini mengikuti konsep *video-observed therapy* (pengamatan minum obat lewat video) yang diakui WHO sebagai alternatif pengawasan tatap muka. Aplikasi ini melengkapi SITB (Sistem Informasi Tuberkulosis Kemenkes) di sisi pendampingan harian, bukan menggantikannya.

## Fitur

**MVP (wajib selesai)**

- [ ] Login dan pembedaan peran (pasien, PMO, nakes)
- [ ] Check-in harian dengan video/foto
- [ ] Laporan efek samping
- [ ] Progres pengobatan pasien ("hari ke-47 dari 180")
- [ ] Dashboard nakes dengan status real-time
- [ ] Tinjau dan verifikasi check-in
- [ ] Peringatan dini pasien berisiko
- [ ] Catatan tindak lanjut nakes

**Kalau sempat**

- [ ] Chatbot edukasi seputar pengobatan dan efek samping
- [ ] Pengecekan awal video check-in dengan AI
- [ ] Skor risiko putus obat yang lebih canggih

## Tech stack

| Bagian | Teknologi |
| --- | --- |
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui (preset Vega) |
| Database & auth | Supabase (Postgres, Auth, Row Level Security) |
| Penyimpanan media | Supabase Storage (bucket privat `checkin-media`) |
| Real-time | Supabase Realtime (Postgres Changes) |
| Deploy | Vercel |

## Menjalankan secara lokal

```bash
git clone https://github.com/WilbertFE/pmo-tbc.git
cd pmo-tbc
npm install
cp .env.example .env.local   # isi nilainya (minta ke kapten lewat chat pribadi)
npm run dev
```

Buka `http://localhost:3000`. Aplikasi pasien ada di `/pasien`, dashboard nakes di `/nakes`.

**Environment variables**

| Nama | Keterangan |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publishable/anon key Supabase |

Jangan pernah commit `.env.local`.

**Database (khusus Kapten)**

Jalankan file di `supabase/migrations/` secara berurutan (001 sampai 006) di SQL Editor Supabase, lalu `supabase/seed.sql` untuk data demo. Seed hanya untuk database development.

**Login Google dan pendaftaran (khusus Kapten, sekali saja)**

Pendaftaran mandiri (form `/daftar` atau Google) selalu menjadi peran `pasien`. Akun baru diarahkan ke `/menunggu-verifikasi` sampai nakes menghubungkannya ke baris di tabel `pasien`.

1. Google Cloud Console, menu APIs & Services:
   - OAuth consent screen: isi nama aplikasi (tanpa kata TBC), email dukungan, lalu tambahkan email penguji selama status masih Testing.
   - Credentials, Create Credentials, OAuth client ID, tipe **Web application**.
   - Authorized redirect URIs: `https://<project-ref>.supabase.co/auth/v1/callback` (lihat di Supabase, Authentication, Sign In / Providers, Google).
2. Supabase, Authentication, Sign In / Providers, **Google**: aktifkan, tempel Client ID dan Client Secret.
3. Supabase, Authentication, URL Configuration:
   - Site URL: domain production, contoh `https://pmo-tbc.vercel.app`.
   - Redirect URLs: `http://localhost:3000/api/auth/callback` dan `https://pmo-tbc.vercel.app/api/auth/callback`.
4. (Opsional) Authentication, Sign In / Providers, Email: matikan **Confirm email** kalau tidak ingin pendaftar membuka email konfirmasi dulu. Email bawaan Supabase dibatasi beberapa email per jam, jadi untuk demo sebaiknya dimatikan atau pakai SMTP sendiri.

Menghubungkan akun baru ke data pengobatan (sementara, lewat SQL Editor sampai ada fitur di dashboard nakes):

```sql
insert into public.pasien (profile_id, nakes_id, tanggal_mulai, jam_minum)
select u.id, '<id nakes>', '2026-10-10', '07:00'
from auth.users u where u.email = '<email pasien>';
```

**Akun demo** (password semua: `demo1234`)

| Email | Peran | Kondisi |
| --- | --- | --- |
| `nakes@demo.id` | nakes | Menangani ketiga pasien di bawah |
| `budi@demo.id` | pasien | Rutin check-in (hijau) |
| `ani@demo.id` | pmo | PMO untuk Pak Budi |
| `wati@demo.id` | pasien | 2 hari tidak check-in (merah) |
| `joko@demo.id` | pasien | Efek samping sedang (kuning) |

**Helper bersama di `src/lib/`** (pakai ini, jangan buat ulang)

| File | Isi |
| --- | --- |
| `supabase/client.ts`, `supabase/server.ts` | Client Supabase untuk browser dan server |
| `supabase/database.types.ts` | Tipe tabel, contoh `Tables<"checkin">` |
| `auth.ts` | `getProfilSaatIni()`, `getPasienSaya()` untuk Server Components |
| `tanggal.ts` | `tanggalWIB()`, `jamWIB()`, `selisihHari()`, `tambahHari()`, `waktuWIB()` |
| `progres.ts` | `hitungProgres()` untuk "Hari ke-47 dari 180" |

Logout: `<form action="/api/auth/logout" method="post">` dengan tombol submit.

## Struktur folder dan penanggung jawab

```
src/
├── app/
│   ├── login/            → halaman login (Kapten)
│   ├── pasien/           → aplikasi check-in pasien/PMO (Programmer 2)
│   └── nakes/            → dashboard nakes (Programmer 3)
├── components/
│   ├── ui/               → komponen shadcn (bersama)
│   ├── pasien/           → komponen khusus aplikasi pasien
│   └── nakes/            → komponen khusus dashboard nakes
└── lib/
    └── supabase/         → koneksi Supabase (Kapten)
supabase/
└── migrations/           → skema database dalam SQL (Kapten)
```

## Tim

| Peran | Nama | GitHub |
| --- | --- | --- |
| Kapten · backend bersama & integrasi | Wilbert | @WilbertFE |
| Programmer · aplikasi pasien | _(isi)_ | _(isi)_ |
| Programmer · dashboard nakes | _(isi)_ | _(isi)_ |
| Desainer UI/UX | _(isi)_ | _(isi)_ |

## Alur kerja Git

- Jangan push langsung ke `main`. Buat branch, lalu buka pull request.
- Nama branch: `feat/pasien-checkin`, `feat/nakes-dashboard`, `fix/upload-video`.
- Pesan commit: `feat: ...`, `fix: ...`, `chore: ...`, `docs: ...`.
- Setiap PR direview minimal 1 orang lain dan di-merge dengan **squash**.
- Task dikelola di GitHub Projects. Satu issue = satu PR jika memungkinkan.

## Transparansi penggunaan AI

Sesuai ketentuan lomba, kami menggunakan AI secara transparan:

| Alat | Digunakan untuk |
| --- | --- |
| Claude | Riset masalah, perencanaan, penulisan kode, dokumentasi |
| _(tambahkan)_ | _(tambahkan)_ |

Seluruh kode hasil bantuan AI direview oleh anggota tim sebelum di-merge.

---

## Konteks untuk AI assistant

> Bagian ini ditulis untuk AI coding assistant (Claude, Cursor, Copilot, dan lainnya). Baca seluruh bagian ini sebelum menulis atau mengubah kode. Jika instruksi pengguna bertentangan dengan bagian ini, tanyakan dulu sebelum mengerjakan.

### Ringkasan proyek

Aplikasi web untuk memantau kepatuhan minum obat pasien tuberkulosis (TBC). Terdiri dari dua aplikasi dalam satu project Next.js:

- **Aplikasi pasien** (`/pasien`) — mobile-first, dipakai pasien atau PMO-nya di ponsel.
- **Dashboard nakes** (`/nakes`) — desktop-first, dipakai tenaga kesehatan puskesmas.

Tenggat pengumpulan karya: **16 Oktober 2026, 23.50 WIB**. Prioritaskan fitur MVP yang berjalan mulus di atas fitur tambahan.

### Glosarium domain

| Istilah | Arti |
| --- | --- |
| TBC | Tuberkulosis. Pengobatannya setiap hari selama sekitar 6 bulan (default 180 hari). |
| PMO | Pengawas Menelan Obat. Orang (biasanya keluarga) yang memastikan pasien minum obat. |
| Nakes | Tenaga kesehatan, di sini pemegang program TBC di puskesmas. |
| Puskesmas | Pusat kesehatan masyarakat, fasilitas kesehatan tingkat pertama. |
| Check-in | Bukti harian bahwa pasien minum obat, berupa video atau foto. |
| Putus obat | Pasien berhenti minum obat sebelum pengobatan selesai. Ini yang ingin dicegah. |
| VOT | Video-observed therapy, pengamatan minum obat lewat video. Dasar konsep aplikasi ini. |
| SITB | Sistem Informasi Tuberkulosis milik Kemenkes. Aplikasi ini tidak terintegrasi dengannya. |

### Peran pengguna dan haknya

| Peran | Boleh melakukan | Tidak boleh |
| --- | --- | --- |
| `pasien` | Check-in, lapor efek samping, lihat progres dan riwayatnya sendiri | Melihat data pasien lain |
| `pmo` | Melakukan check-in dan lapor efek samping atas nama pasien yang ia dampingi, melihat progres pasien tersebut | Melihat data pasien lain |
| `nakes` | Melihat semua pasien yang ia tangani, meninjau dan memverifikasi check-in, menulis tindak lanjut | Melihat pasien yang ditangani nakes lain |

Setelah login, pengguna diarahkan sesuai peran: `pasien` dan `pmo` ke `/pasien`, `nakes` ke `/nakes`. Peran disimpan di tabel `profiles`.

### Alur utama

**Check-in harian (aplikasi pasien)**

1. Pasien/PMO membuka `/pasien` dan melihat status hari ini: sudah atau belum check-in.
2. Menekan tombol besar "Check-in sekarang".
3. Merekam video singkat (maksimal sekitar 15 detik) atau mengambil foto saat minum obat.
4. File diunggah ke bucket `checkin-media`, lalu baris baru dibuat di tabel `checkin` dengan status `menunggu`.
5. Opsional: melaporkan efek samping (jenis dan tingkat).
6. Layar konfirmasi menampilkan progres, misalnya "Hari ke-47 dari 180".

Satu pasien hanya boleh punya satu check-in per tanggal (dijaga oleh constraint `unique (pasien_id, tanggal)`).

**Peninjauan (dashboard nakes)**

1. Nakes membuka `/nakes` dan melihat daftar pasiennya dengan indikator status (hijau, kuning, merah).
2. Daftar diperbarui secara real-time saat ada check-in atau laporan efek samping baru.
3. Nakes membuka check-in, memutar video/foto, lalu menandai `terverifikasi` atau `ditolak`.
4. Untuk pasien berstatus merah, nakes menulis catatan di `tindak_lanjut`.

### Aturan peringatan dini (versi awal, bisa disesuaikan)

Status pasien dihitung pada waktu Asia/Jakarta:

| Status | Kondisi |
| --- | --- |
| 🔴 Merah | Tidak ada check-in pada 2 hari terakhir berturut-turut (kemarin dan hari ini setelah jam minum lewat), **atau** ada laporan efek samping tingkat `berat` dalam 3 hari terakhir |
| 🟡 Kuning | Belum check-in hari ini dan sudah lewat lebih dari 2 jam dari `jam_minum`, **atau** ada laporan efek samping tingkat `sedang` dalam 3 hari terakhir |
| 🟢 Hijau | Sudah check-in hari ini dan tidak memenuhi kondisi merah atau kuning |

Jika kondisi merah dan kuning sama-sama terpenuhi, gunakan merah. Taruh logika ini di satu fungsi yang bisa dipakai ulang, bukan tersebar di komponen.

### Model data

Skema lengkap ada di `supabase/migrations/`. Ringkasannya:

| Tabel | Kolom penting | Keterangan |
| --- | --- | --- |
| `profiles` | `id` (= `auth.users.id`), `nama`, `peran` | Peran: `pasien`, `pmo`, `nakes` |
| `pasien` | `id`, `profile_id`, `pmo_id`, `nakes_id`, `tanggal_mulai`, `durasi_hari` (default 180), `jam_minum` | Data pengobatan per pasien |
| `checkin` | `id`, `pasien_id`, `tanggal`, `media_path`, `status`, `created_at` | Status: `menunggu`, `terverifikasi`, `ditolak`. Unik per pasien per tanggal |
| `efek_samping` | `id`, `pasien_id`, `jenis`, `tingkat`, `catatan`, `created_at` | Tingkat: `ringan`, `sedang`, `berat` |
| `tindak_lanjut` | `id`, `pasien_id`, `nakes_id`, `catatan`, `created_at` | Catatan tindakan nakes |

Perhitungan progres: `hari_ke = (tanggal hari ini WIB − tanggal_mulai) + 1`, dibatasi maksimal `durasi_hari`.

### Aturan teknis penting

**Zona waktu**
- Semua logika tanggal memakai zona waktu **Asia/Jakarta (WIB)**.
- Database Supabase memakai UTC. Jangan mengandalkan `current_date` di database untuk menentukan "hari ini" pasien; tentukan tanggal WIB di sisi aplikasi lalu kirim nilainya secara eksplisit.

**Privasi dan keamanan (wajib)**
- Row Level Security aktif di semua tabel. Jangan pernah menonaktifkannya untuk "memperbaiki" error akses; tulis policy yang benar.
- Jangan pernah memakai service role key di kode client.
- Bucket `checkin-media` bersifat privat. Tampilkan media hanya dengan **signed URL** berumur pendek, jangan public URL.
- Path file media: `{pasien_id}/{tanggal}.{ekstensi}`, misalnya `8f2c.../2026-10-14.webm`.
- TBC masih membawa stigma. **Teks notifikasi, judul tab, dan pesan yang mungkin terlihat orang lain tidak boleh menyebut "TBC" atau "tuberkulosis".** Gunakan teks netral, misalnya "Waktunya minum obat".

**Real-time**
- Tabel `checkin` dan `efek_samping` sudah masuk publikasi `supabase_realtime`.
- Realtime mengikuti RLS. Jika event tidak masuk, periksa policy `select` lebih dulu.
- Selalu lepas channel saat komponen di-unmount (`supabase.removeChannel(channel)`).

**Supabase di Next.js**
- Gunakan `@supabase/ssr`. Client untuk browser dan server dibuat di `src/lib/supabase/`; jangan membuat client baru di tempat lain.
- Gunakan Server Components secara default. Tambahkan `"use client"` hanya untuk komponen yang butuh interaksi, kamera, atau real-time.

### Konvensi kode

- TypeScript dengan tipe yang jelas; hindari `any`.
- Nama tabel dan kolom database memakai Bahasa Indonesia sesuai skema. Nama variabel dan fungsi TypeScript boleh Bahasa Inggris, tetapi saat merujuk kolom database gunakan nama aslinya.
- Seluruh teks antarmuka memakai **Bahasa Indonesia** yang sederhana.
- Gunakan komponen shadcn/ui yang sudah ada di `src/components/ui/` sebelum membuat komponen baru.
- Komponen khusus satu aplikasi diletakkan di `src/components/pasien/` atau `src/components/nakes/`.
- Perubahan skema database selalu dibuat sebagai file migrasi baru di `supabase/migrations/` dengan nomor urut (`003_...sql`), bukan mengedit file lama.

### Pedoman desain

- **Aplikasi pasien:** mobile-first, tombol besar, teks sedikit, satu aksi utama per layar. Penggunanya bisa lansia atau tidak terbiasa dengan teknologi. Alur check-in harus selesai dalam beberapa ketukan.
- **Dashboard nakes:** desktop-first, padat informasi, status warna mudah dipindai, pasien berstatus merah selalu tampil paling atas.

### Di luar cakupan (jangan dibangun kecuali diminta)

- Verifikasi otomatis dengan computer vision bahwa pasien benar-benar menelan obat. Verifikasi dilakukan nakes secara manual.
- Integrasi dengan SITB atau sistem pemerintah lainnya.
- Aplikasi native Android/iOS. Aplikasi pasien cukup berupa web app yang nyaman di ponsel.
- Integrasi WhatsApp Business API.
- Pembayaran, chat antar pengguna, atau fitur media sosial.