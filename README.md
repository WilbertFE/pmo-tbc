# PMO TBC: Pendamping Digital Pengawas Menelan Obat

> Dibuat untuk Hackathon JOINTS UGM 2026, tema **Healthcare**. Di dalam aplikasi, nama yang tampil adalah "Pendamping Minum Obat" supaya tidak menyebut nama penyakit (mengurangi stigma).

Sistem pemantauan minum obat dua arah untuk pasien tuberkulosis (TBC): **pasien dan PMO** melakukan check-in harian dengan video atau foto, sementara **nakes puskesmas** memantau, memverifikasi, dan menindaklanjuti pasien yang berisiko putus obat lewat dashboard real-time.

**Demo:** https://pmo-tbc.vercel.app/ · **Video:** https://youtu.be/o43DOxu3Hg0 · **Pitch deck:** https://www.figma.com/design/s8HkBLFfeVzoQ8XqhSRJ81/Pitchdeck-Joints-UGM-2026--Copy-

---

## Masalah

- Indonesia menempati posisi kedua beban kasus TBC tertinggi di dunia setelah India.
- Pengobatan TBC berlangsung sekitar 6 bulan, setiap hari. Jika pasien berhenti di tengah jalan, pengobatan bisa harus diulang dan bakteri berisiko menjadi kebal obat.
- Peran PMO (biasanya anggota keluarga) berhubungan dengan kepatuhan minum obat, tetapi pengawasannya masih manual dan nakes sulit memantau banyak pasien setiap hari.

## Solusi

Aplikasi ini bukan sekadar pengingat. Ini sistem pemantauan yang menghubungkan pasien, keluarga, dan puskesmas:

1. **Check-in harian:** pasien atau PMO merekam video (maksimal 15 detik) atau foto saat minum obat langsung dari ponsel.
2. **Dashboard nakes real-time:** nakes melihat status semua pasiennya hari ini (merah, kuning, hijau), meninjau bukti, dan langsung mendapat notifikasi saat ada check-in baru atau pasien berubah merah.
3. **Peringatan dini dan skor risiko:** pasien yang bolong, terlambat, atau mengalami efek samping berat naik ke urutan teratas, lengkap dengan alasannya.
4. **Bantuan AI:** chatbot edukasi untuk pasien dan cek awal bukti check-in untuk nakes. Keputusan tetap di tangan nakes.

Pendekatan ini mengikuti konsep *video-observed therapy* (pengamatan minum obat lewat video) yang diakui WHO sebagai alternatif pengawasan tatap muka. Aplikasi ini melengkapi SITB (Sistem Informasi Tuberkulosis Kemenkes) di sisi pendampingan harian, bukan menggantikannya.

## Fitur

**Aplikasi pasien dan PMO** (mobile-first, `/pasien`)

- [x] Daftar dengan email atau Google, lalu menunggu nakes menghubungkan akun ke data pengobatan
- [x] Beranda dengan status hari ini dan satu tombol besar "Check-in sekarang"
- [x] Check-in dengan rekam video langsung (berhenti otomatis 15 detik), ambil foto, atau pilih dari galeri
- [x] Kirim ulang bukti kalau ditolak nakes
- [x] Laporan efek samping (jenis dan tingkat ringan, sedang, berat)
- [x] Progres pengobatan ("Hari ke-47 dari 180"), streak, dan kalender check-in
- [x] **Chatbot edukasi (AI):** tanya jawab seputar minum obat dan efek samping, tanpa diagnosis, mengarahkan ke petugas untuk tanda bahaya

**Dashboard nakes** (desktop-first, `/nakes`)

- [x] Daftar pasien dengan status merah, kuning, hijau; pasien merah selalu di atas
- [x] Pembaruan real-time dan notifikasi saat ada check-in baru atau pasien berubah merah
- [x] Tinjau bukti (video atau foto) dan tandai terverifikasi atau ditolak, termasuk riwayat 7 hari
- [x] **Cek awal bukti dengan AI:** saran apakah wajah, obat, dan proses menelan terlihat
- [x] **Skor risiko putus obat** (0 sampai 100) dari pola 14 hari, dengan alasan setiap faktor
- [x] Grafik tingkat kepatuhan 14 hari
- [x] Catatan tindak lanjut untuk pasien berisiko
- [x] Tambah pasien: menghubungkan akun pasien (dan PMO) yang sudah mendaftar

**Keamanan dan privasi**

- Row Level Security di semua tabel: pasien hanya melihat datanya sendiri, nakes hanya melihat pasien yang ia tangani.
- Media check-in disimpan di bucket privat dan hanya dibuka lewat signed URL berumur pendek.
- Teks yang mungkin terlihat orang lain (judul tab, notifikasi, landing page) tidak menyebut "TBC" atau "tuberkulosis".

## Cara mencoba (untuk juri)

Buka https://pmo-tbc.vercel.app/ dan masuk dengan akun demo berikut (password semua: `demo1234`).

| Email | Peran | Yang bisa dilihat |
| --- | --- | --- |
| `nakes@demo.id` | nakes (Bu Sari) | Dashboard dengan Bu Wati (merah, risiko tinggi), Pak Joko (kuning, risiko sedang), Pak Budi (hijau, risiko rendah) |
| `budi@demo.id` | pasien | Sudah check-in hari ini |
| `ani@demo.id` | PMO | Mendampingi Pak Budi |
| `wati@demo.id` | pasien | Belum check-in 2 hari, bisa dicoba check-in |
| `joko@demo.id` | pasien | Ada efek samping sedang |
| `nakes2@demo.id` | nakes kedua (Pak Andi) | Hanya melihat pasiennya sendiri (Bu Rina), tidak melihat pasien Bu Sari |

**Skenario singkat (sekitar 3 menit):**

1. Masuk sebagai `wati@demo.id`, ketuk **Check-in sekarang**, rekam video singkat atau ambil foto, lalu kirim.
2. Buka **Tanya** dan coba tanyakan "Kalau lupa minum obat, harus bagaimana?".
3. Masuk sebagai `nakes@demo.id` (di perangkat atau browser lain). Status Bu Wati sudah berubah. Kalau dashboard nakes dibuka lebih dulu sebelum pasien check-in, perubahan dan notifikasinya muncul tanpa perlu memuat ulang halaman.
4. Klik Bu Wati, lihat **Risiko Putus Obat** beserta alasannya, lalu klik **Tinjau Bukti** untuk melihat media dan hasil **Cek awal AI**.
5. Tandai **Verifikasi Valid** atau **Tolak Bukti**. Kalau ditolak, beranda pasien akan meminta check-in ulang.

## Alur aplikasi

```
Pasien / PMO (ponsel)                         Nakes (desktop)
------------------------                      ------------------------------------
Beranda: status hari ini                      Dashboard: status semua pasien
   |                                             ^  (real-time)
Check-in: rekam video / foto  ---- upload ---->  |  Supabase Storage (privat)
   |                                             |
Simpan baris checkin (menunggu) -- realtime ---> Notifikasi + urutan prioritas
   |                                             |
Lapor efek samping (opsional) --- realtime --->  Peringatan dini (merah/kuning)
   |                                             |
Progres "Hari ke-X dari 180"                  Tinjau bukti + Cek awal AI (saran)
                                                 |
Beranda: "perlu kirim ulang"  <--- ditolak ---  Terverifikasi / Ditolak
                                                 |
                                              Skor risiko + catatan tindak lanjut
```

**Aturan peringatan dini** (dihitung dalam WIB, di `src/lib/status-pasien.ts`):

| Status | Kondisi |
| --- | --- |
| Merah | Tidak check-in kemarin dan hari ini sudah lewat jam minum, atau ada efek samping `berat` dalam 3 hari terakhir |
| Kuning | Belum check-in hari ini dan lewat lebih dari 2 jam dari jam minum, atau ada efek samping `sedang` dalam 3 hari terakhir |
| Hijau | Sudah check-in hari ini dan tidak memenuhi kondisi di atas |

Check-in yang buktinya ditolak nakes dihitung sebagai belum check-in, dan dashboard menampilkan alasan "pasien perlu check-in ulang".

**Skor risiko putus obat** (di `src/lib/risiko-putus-obat.ts`, berbasis aturan supaya konsisten dan bisa dijelaskan):

| Faktor (14 hari terakhir) | Poin |
| --- | --- |
| Persentase hari tanpa check-in sah (bukti ditolak dihitung bolong) | sampai 40 |
| Bolong berturut-turut sampai kemarin: 2 hari / 3 hari ke atas | 10 / 20 |
| Persentase check-in terlambat lebih dari 2 jam | sampai 10 |
| Bukti ditolak | 5 per kejadian, maksimal 10 |
| Efek samping berat / sedang | 15 / 8, maksimal 20 |
| Fase lanjutan (hari ke-50 sampai 120), saat pasien sering merasa sudah sembuh | 5 |

Level: rendah (di bawah 30), sedang (30 sampai 59), tinggi (60 ke atas).

## Tech stack

| Bagian | Teknologi |
| --- | --- |
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database & auth | Supabase (Postgres, Auth dengan email dan Google, Row Level Security) |
| Penyimpanan media | Supabase Storage (bucket privat `checkin-media`) |
| Real-time | Supabase Realtime (Postgres Changes) |
| AI di dalam produk | Google Gemini lewat `@google/genai` (`gemini-3.5-flash-lite` untuk chatbot, `gemini-3.8-flash` untuk cek bukti) |
| Unit test | Vitest |
| Deploy | Vercel |

## Menjalankan secara lokal

Butuh Node.js 20 atau lebih baru dan project Supabase.

```bash
git clone https://github.com/WilbertFE/pmo-tbc.git
cd pmo-tbc
npm install
cp .env.example .env.local   # isi nilainya
npm run dev                  # buka http://localhost:3000
```

Perintah lain: `npm run build` (build production), `npm run lint`, `npm test` (unit test logika status, tanggal WIB, progres, dan skor risiko).

**Environment variables** (`.env.local`, jangan pernah di-commit)

| Nama | Keterangan |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publishable/anon key Supabase |
| `GEMINI_API_KEY` | Kunci dari Google AI Studio, hanya dipakai di server (chatbot dan cek bukti). Tanpa kunci ini kedua fitur AI menampilkan pesan "belum diaktifkan", fitur lain tetap jalan |

**Menyiapkan database Supabase**

1. Jalankan file di `supabase/migrations/` secara berurutan (`001` sampai `008`) di SQL Editor Supabase.
2. Jalankan `supabase/seed.sql` untuk akun dan data demo (khusus database development).
3. Sebelum presentasi, jalankan `supabase/demo-reset.sql` (setelah pukul 09.00 WIB) supaya check-in 14 hari terakhir, status, dan skor risiko pasien demo sesuai tabel di atas. Skrip ini aman dijalankan berulang dan hanya menyentuh akun `@demo.id`.

**Login Google (opsional)**

1. Google Cloud Console: buat OAuth client ID tipe **Web application** dengan redirect URI `https://<project-ref>.supabase.co/auth/v1/callback`. Nama aplikasi di consent screen tanpa kata TBC.
2. Supabase, Authentication, Sign In / Providers, **Google**: aktifkan, isi Client ID dan Client Secret.
3. Supabase, Authentication, URL Configuration: Site URL ke domain production, Redirect URLs `http://localhost:3000/api/auth/callback` dan `https://<domain>/api/auth/callback`.
4. Untuk demo, matikan **Confirm email** di Authentication, Sign In / Providers, Email, atau pakai SMTP sendiri.

Pendaftaran mandiri (form `/daftar` atau Google) selalu menjadi peran `pasien`. Akun baru diarahkan ke `/menunggu-verifikasi` sampai nakes menghubungkannya lewat tombol **Tambah Pasien** di dashboard.

## Struktur folder

```
src/
├── app/
│   ├── page.tsx, _landing/   → landing page publik
│   ├── login/, daftar/       → masuk dan daftar
│   ├── menunggu-verifikasi/  → akun yang belum dihubungkan nakes
│   ├── pasien/               → aplikasi pasien/PMO (beranda, laporan, progress, efek-samping, tanya)
│   │   └── components/
│   ├── nakes/                → dashboard nakes
│   │   └── components/
│   └── api/                  → API route (auth, pasien, nakes)
├── components/               → komponen bersama, termasuk ui/ (shadcn)
└── lib/
    ├── supabase/             → client Supabase dan tipe database
    ├── status-pasien.ts      → aturan peringatan dini
    ├── risiko-putus-obat.ts  → skor risiko putus obat
    ├── cek-bukti-ai.ts       → cek awal bukti dengan Gemini
    ├── gemini.ts             → client Gemini (server)
    ├── tanggal.ts, progres.ts
    └── *.test.ts             → unit test (Vitest)
supabase/
├── migrations/               → skema, RLS, storage (001 sampai 008)
├── seed.sql                  → data demo
└── demo-reset.sql            → reset data demo untuk presentasi
docs/design/                  → referensi desain dari Figma
```

## Tim

Tim "ga ada saran nama tim? @all", Institut Teknologi Sepuluh Nopember.

| Peran | Nama | GitHub |
| --- | --- | --- |
| Ketua dan programmer · backend, database, integrasi | Wilbert Bernardi | [@WilbertFE](https://github.com/WilbertFE) |
| Programmer · aplikasi pasien | Fatih Ihsan Ramadhan | [@mvfflin](https://github.com/mvfflin) |
| Programmer · dashboard nakes | Hanif Ardhito Narawangsa | [@wangggsa](https://github.com/wangggsa) |
| Desainer UI/UX dan pitch deck | Muhammad Keefa Syawal | - |

## Transparansi penggunaan AI

Sesuai ketentuan lomba, penggunaan AI kami cantumkan secara terbuka.

**AI di dalam produk**

| Alat | Peran |
| --- | --- |
| Google Gemini (`gemini-3.5-flash-lite`) | Chatbot edukasi pasien seputar minum obat dan efek samping |
| Google Gemini (`gemini-3.8-flash`) | Cek awal bukti check-in (wajah, obat, proses menelan). Hanya saran untuk nakes, tidak pernah mengubah status check-in |

**AI dalam proses pengerjaan**

| Alat | Digunakan untuk |
| --- | --- |
| Claude (Claude Code) | Riset masalah, perencanaan, penulisan dan review kode, pengujian di browser, dokumentasi, penyusunan proposal, revisi pitch deck, serta perekaman dan penyuntingan video demo (narasi direkam sendiri oleh tim) |

Seluruh kode hasil bantuan AI direview oleh anggota tim sebelum di-merge.

## Alur kerja Git

- Jangan push langsung ke `main`. Buat branch, lalu buka pull request yang di-merge dengan **squash**.
- Nama branch: `feat/...`, `fix/...`, `docs/...`, `chore/...`.
- Pesan commit mengikuti conventional commits, contoh `feat(pasien): ...`.

## Untuk AI coding assistant

Aturan proyek, pembagian tugas tim, model data, dan aturan teknis lengkap ada di [`AGENTS.md`](AGENTS.md). Baca file itu sebelum menulis atau mengubah kode.
