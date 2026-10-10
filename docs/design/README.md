# Referensi Desain

Ringkasan desain dari Figma untuk anggota tim dan AI agent yang tidak bisa membuka Figma. Semua nilai warna dan tipografi di bawah diambil langsung dari style lokal file Figma (bukan ditebak dari gambar).

- **Sumber:** Figma "Joints UGM 2026 (Copy)", https://www.figma.com/design/nxYNDIXOo4XRoYXGyA5agg/Joints-UGM-2026--Copy-
- **Diambil:** 10 Oktober 2026. Kalau desain di Figma berubah, perbarui file ini dan gambarnya.
- **Status desain:** masih dikerjakan. Banyak teks dan elemen masih sisa template (hotel "edOTEL" dan toko tirai "Tirai.id"). Lihat bagian [Sisa template](#sisa-template-jangan-ditiru).

> **Prioritas:** kalau desain bertentangan dengan `AGENTS.md` (alur, peran, data, privasi, bahasa), ikuti `AGENTS.md`. Desain dipakai untuk tampilan: warna, tipografi, jarak, bentuk komponen, dan tata letak.

---

## 1. Warna

### Primary (hijau, warna utama brand)

| Token | Hex |
| --- | --- |
| green-50 | `#e6efec` |
| green-100 | `#b3ccc5` |
| green-200 | `#8eb4a9` |
| green-300 | `#5a9282` |
| green-400 | `#3a7d69` |
| **green-500 (utama)** | **`#095c44`** |
| green-600 | `#08543e` |
| green-700 | `#064130` |
| green-800 | `#053325` |
| green-900 | `#04271d` |

### Secondary (krem hangat, di Figma bernama "orange")

| Token | Hex |
| --- | --- |
| orange-50 | `#fdfbfa` |
| orange-100 | `#f7f4f0` |
| orange-200 | `#f4eee8` |
| orange-300 | `#eee6de` |
| orange-400 | `#ebe1d8` |
| orange-500 | `#e6dace` |
| orange-600 | `#d1c6bb` |
| orange-700 | `#a39b92` |
| orange-800 | `#7f7871` |
| orange-900 | `#615c57` |

### Grey (teks, garis, latar)

| Token | Hex | Dipakai untuk |
| --- | --- | --- |
| Grey 50 | `#fafafa` | Latar halaman |
| Gray 100 | `#f4f4f5` | Latar input, kartu abu |
| Gray 200 | `#e4e4e7` | Garis tepi, pemisah |
| Grey 300 | `#d4d4d8` | Garis tepi tegas |
| Grey 400 | `#9f9fa9` | Placeholder |
| Grey 500 | `#71717b` | Teks sekunder |
| Grey 600 | `#52525c` | |
| Grey 700 | `#3f3f47` | |
| Grey 800 | `#27272a` | |
| (text primary) | `#18181b` | Teks utama |

### Neutral

| Token | Hex |
| --- | --- |
| White | `#fcfcfc` |
| White 80% | `#fdfdfd` |
| Black | `#292929` |
| Black 80% | `#3f3f3f` |

### State (status)

| Token | Teks/ikon | Latar (50) |
| --- | --- | --- |
| Alert | `#e74c3c` | `#ffe8e5` |
| Warning | `#f39c12` | `#fdf0e8` |
| Success | `#20c997` | `#e5fff7` |
| Info | `#3498db` | `#e5f5ff` |

**Pemetaan ke status early warning** (lihat `AGENTS.md` bagian 7):

| Status pasien | Warna | Contoh label di desain |
| --- | --- | --- |
| Merah | Alert `#e74c3c` | "Efek Samping Berat" |
| Kuning | Warning `#f39c12` | "Terlewat 2 Hari" |
| Hijau | Success `#20c997` | "Sudah Minum Obat" |
| Menunggu verifikasi / info | Info `#3498db` | Kotak "Informasi Penting" |

Di desain, badge status berbentuk pill penuh (latar warna solid, teks putih, titik putih kecil di kiri).

---

## 2. Tipografi

Font: **General Sans** (gratis dari Fontshare, https://www.fontshare.com/fonts/general-sans). Font ini **tidak ada di Google Fonts**, jadi harus diunduh dan dimuat lewat `next/font/local`. Kalau belum dipasang, pakai font sans yang sudah ada di proyek.

Heading memakai Medium (500), body memakai Regular (400). Letter spacing 0 untuk semua.

| Style | Ukuran / line height (px) | Berat |
| --- | --- | --- |
| Display D1 | 64 / 76 | Medium |
| Display D2 | 52 / 60 | Medium |
| Heading H1 | 48 / 56 | Medium |
| Heading H2 | 40 / 48 | Medium |
| Heading H3 | 32 / 40 | Medium |
| Heading H4 | 24 / 32 | Medium |
| Heading H5 | 20 / 24 | Medium |
| Heading H6 | 18 / 22 | Medium |
| Body Extra Large | 20 / 24 | Regular |
| Body Large | 18 / 22 | Regular |
| Body Medium | 16 / 20 | Regular |
| Body Small | 14 / 18 | Regular |
| Body Extra Small | 12 / 16 | Regular |
| Button | 16 / 22 | Medium |

---

## 3. Jarak dan bentuk

- **Skala spacing:** 8, 12, 24, 32 px (variabel `space-100`, `150`, `300`, `400`). Kelipatan 4 px.
- **Radius:** 12 px untuk kartu, input, dan tombol (variabel `md`). Badge status dan tag kecil berbentuk pill (radius penuh).
- **Bayangan:** hampir tidak ada. Pemisahan memakai garis tepi tipis (Gray 200) dan latar abu muda.

---

## 4. Komponen

Gambar semua varian: [`01-design-system.png`](01-design-system.png).

| Komponen | Bentuk di desain | Padanan di kode |
| --- | --- | --- |
| Primary Button | Latar green-500, teks putih, tinggi 44 px, radius 12 px. Ada varian merah (Alert) untuk aksi berbahaya | `Button` shadcn variant default |
| Secondary Button | Latar putih, garis tepi abu, teks hijau. Contoh: "Masuk dengan Google" (tinggi 48 px) | `Button` variant outline |
| Tertiary Button | Hanya teks hijau tanpa latar | `Button` variant ghost atau link |
| Inputfield | Label di atas (Body Medium), kolom latar Gray 100 tanpa garis, radius 12 px, ikon di kiri (contoh amplop, gembok), ikon mata di kanan untuk sandi. Status: normal, focus (garis biru), error (garis dan teks merah), disabled. Ada varian select dan textarea | `Input`, `Label` shadcn |
| Tag / chip | Pill kecil latar Info 50 atau green-50 dengan teks berwarna. Contoh: "Check in", "Tentang Kami" | Belum ada, bisa pakai `Badge` shadcn |
| Badge status | Lihat bagian Warna di atas | Belum ada, bisa pakai `Badge` shadcn |
| Kartu | Latar putih atau Gray 100, radius 12 px, garis tepi tipis | `Card` shadcn |
| Navbar | Logo kiri, menu teks kanan ("Beranda", "Check in", "Tentang Kami") | Belum ada |
| Ikon | Set ikon linear dan filled di Figma | Pakai `lucide-react` yang sudah terpasang |

---

## 5. Layar

### Login: [`auth-01-login.png`](auth-01-login.png)

Desktop 1440 x 1024, dibagi dua kolom:
- **Kiri:** foto tenaga kesehatan, dengan kartu putih berisi judul dan deskripsi di bagian bawah.
- **Kanan:** "Masuk ke Akun Anda" (Heading H2), "Belum mempunyai akun? Daftar", tombol "Masuk dengan Google", pemisah "Atau dengan Email", input Email dan Sandi, tombol utama.

**Yang berbeda dari aplikasi:**
- Akun dibuat oleh admin, tidak ada pendaftaran mandiri dan tidak ada login Google (peran diambil dari `app_metadata`, supaya orang tidak bisa mendaftar sebagai nakes). Hapus "Daftar" dan "Masuk dengan Google", atau ganti dengan teks "Belum punya akun? Hubungi petugas puskesmas".
- Tombol utama di desain bertuliskan "Daftar". Seharusnya "Masuk".
- Di ponsel, sembunyikan foto dan tampilkan form satu kolom.
- Kode yang sudah ada: `src/app/login/`.

### Daftar: [`auth-02-daftar.png`](auth-02-daftar.png)

Form Nama, Email, Kata Sandi, Konfirmasi Kata Sandi. **Tidak dipakai** di MVP (lihat poin Login di atas).

### Landing page: [`landing-01.png`](landing-01.png)

Untuk halaman `/` (sekarang masih placeholder). Bagian dari atas ke bawah:
1. Navbar: LOGO, Beranda, Check in, Tentang Kami.
2. Hero berlatar foto gelap: tag "Teman Perjalanan Terbaik", judul "Pantau Rutinitas Minum Obat Anda Setiap Hari dengan Mudah", subjudul, tombol "Mulai Perjalananmu".
3. Tentang Kami: dua foto, kartu "100+ Faskes Terhubung", kartu "Pasien 500+", judul "Kami Mendukung Penuh Masa Pemulihan Anda".
4. Tiga kartu fitur bernomor: Check-in harian (01), Pengingat & eskalasi (02), Chatbot Edukasi (03).
5. "Mulai Rutinitas Anda dengan 3 Langkah Mudah": Terima Pengingat, Lakukan Check-in, Pemantauan Aman.
6. Testimoni: satu kartu kutipan dengan nama dan pekerjaan, ada indikator slide.
7. Footer.

Ada juga versi breakpoint per bagian di Figma: sm (sampai 389 px), md (390 sampai 809 px), lg (810 sampai 1199 px).

Catatan: "Chatbot Edukasi" adalah fitur "kalau sempat", bukan MVP. Angka "100+ Faskes" dan "500+ Pasien" adalah contoh, jangan diklaim sebagai data asli.

### Check-in pasien: [`pasien-01-checkin.png`](pasien-01-checkin.png)

Untuk `/pasien` (Programmer 2). Isi desain:
- Tag "Check in", judul "Mulai Rutinitas Sehat Anda", deskripsi.
- Dua kartu angka: **Progress "47 Hari"** (di bawahnya "-123 Hari", sisa hari) dan **Streak "12 Hari"** ("+1 today").
- Form "Lapor Check-in Hari Ini": Upload Bukti (video), Alamat Email, Nomor Telepon, Catatan Tambahan (opsional).
- Kotak "Informasi Penting" (latar Info 50): wajah dan obat harus terlihat jelas, batas check-in pukul 23.59, efek samping berat akan dihubungi nakes.
- Tombol "Kirim Laporan".
- Panel kanan "Ringkasan Pengobatan": nama program, tanggal mulai, target selesai, daftar obat dan jumlah tablet, "Terhubung dengan Nakes".

**Yang berbeda dari aplikasi:**
- Email dan nomor telepon tidak perlu diminta, karena data itu sudah ada di akun.
- Bukti check-in direkam langsung dari kamera (video sekitar 15 detik) atau berupa foto, bukan sekadar upload file. Upload langsung dari browser ke Storage (`AGENTS.md` bagian 6).
- Laporan efek samping butuh pilihan **jenis** dan **tingkat** (`ringan`, `sedang`, `berat`), tidak cukup catatan bebas.
- Daftar obat, jumlah tablet, dan "Fase Intensif" tidak ada di database. Lewati untuk MVP.
- Progress dihitung dengan `hitungProgres()` di `src/lib/progres.ts`. Streak bisa dihitung dari riwayat `checkin`.
- Desain ini satu halaman desktop. Pasien memakai ponsel dan bisa jadi lansia: buat mobile-first, tombol besar, satu aksi utama per layar. Contohnya, layar status hari ini, lalu layar rekam, lalu layar konfirmasi.

### Dashboard nakes: [`nakes-01-dashboard.png`](nakes-01-dashboard.png)

Untuk `/nakes` (Programmer 3). Desktop 1440 x 908:
- **Sidebar kiri:** logo dan "Portal Nakes", kotak Search, Main Menu (Dashboard, Daftar Pasien, Patient), Tools (Summary, Order, Customer).
- **Konten:** judul "Patient Monitoring", toolbar (Table View, Filter, Sort, Assign Room, tombol "+ Add").
- **Tabel:** checkbox, Nama Pasien, Progres ("237 / 360 Hari"), Waktu Check-in ("Mon, 21 Jan"), Status Hari Ini (badge pill berwarna). Paginasi "Rows per page".
- **Grafik:** "Tingkat Kepatuhan Pasien", subjudul "Persentase Check-in Tepat Waktu Harian", grafik area hijau.
- **Panel detail kanan:** [`nakes-03-panel-detail.png`](nakes-03-panel-detail.png). Badge status, waktu check-in, lalu tombol Edit dan Delete.

Versi mobile: [`nakes-02-dashboard-mobile.png`](nakes-02-dashboard-mobile.png). Isinya masih template hotel utuh, jadi hanya dipakai sebagai acuan tata letak (header dengan tombol Menu, tabel yang bisa digeser ke samping, grafik di bawah).

**Yang berbeda dari aplikasi:**
- Kode dashboard sudah dibuat di `src/app/nakes/` dengan tampilan sendiri. Sesuaikan tampilannya saja (warna, tipografi, badge), jangan ditulis ulang dari nol.
- Pasien merah selalu di urutan teratas (`AGENTS.md` bagian 7).
- Panel detail di aplikasi berisi pemutar video atau foto check-in (signed URL), tombol "Verifikasi" dan "Tolak", serta catatan tindak lanjut. Bukan Edit dan Delete.
- Grafik kepatuhan belum ada di kode. Ini opsional, bukan MVP.
- Semua teks harus Bahasa Indonesia, misalnya "Pemantauan Pasien", bukan "Patient Monitoring".

---

## Sisa template (jangan ditiru)

Elemen berikut berasal dari template lain dan **tidak boleh** muncul di aplikasi:

| Di mana | Sisa template |
| --- | --- |
| Dashboard (sidebar, navbar, mobile) | Logo dan nama "edOTEL" / "MyedOTEL" |
| Dashboard | "Assign Room", "Room Type", "Room Number", "Est. Check-Out", "Deluxe", menu "Order" dan "Customer" |
| Dashboard mobile | "Guest Name", "Occupancy Rate", "Guests per Day" |
| Footer (landing, check-in) | Logo "Tirai.id", menu Produk, Custom, Blog, alamat kantor di Malang dan Surabaya, "loremipsum@gmail.com" |
| Kartu foto login dan daftar | Teks tentang tirai, "Tirai.id", "Acara Asean Panji" |
| Landing | Tombol bertuliskan "Button" dengan ikon placeholder |

Ingat juga aturan privasi: teks yang bisa dilihat orang lain (judul tab, notifikasi, hero) **tidak boleh** menyebut "TBC" atau "tuberkulosis".

---

## Halaman lain di file Figma

| Halaman | Isi |
| --- | --- |
| 🎨 Style Guide | Palet warna dan tipografi ([`00-style-guide.png`](00-style-guide.png)) |
| ↳ Icon apps, Icon Linear, Icon Filled | Set ikon |
| ↳ Design System | Komponen ([`01-design-system.png`](01-design-system.png)), ditambah contoh sitemap template |
| 🥅 Wireframe, Auth Page, User Page, Admin Page | Kosong, hanya judul pemisah |

Kalau punya akses Figma, node ID frame utama: Login `6:6184`, Daftar `6:6431`, Landing `4:22966`, Check-in `53:4267`, Dashboard `61:7595`, Dashboard mobile `61:6670`, Panel detail `61:6793`.
