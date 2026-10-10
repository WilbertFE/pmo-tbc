# Panduan Kerja Tim: Git dan GitHub

Panduan ini untuk semua anggota tim PMO TBC. Ikuti urutannya dari atas kalau baru pertama kali setup, lalu pakai bagian **Rutinitas harian** setiap kali mulai coding.

Aturan emas:

1. **Jangan pernah push langsung ke `main`.** Semua perubahan lewat pull request (PR).
2. **Selalu ambil kode terbaru sebelum mulai coding.**
3. **Kerjakan di folder wilayahmu sendiri** (lihat bagian Scope di `AGENTS.md`).
4. **Jangan pernah commit `.env.local`** atau file rahasia lainnya.

---

## 1. Setup pertama kali (sekali saja)

### 1.1 Pasang alat

- [Git](https://git-scm.com/downloads)
- [Node.js versi LTS](https://nodejs.org/)
- [VS Code](https://code.visualstudio.com/) atau editor pilihanmu

Cek apakah sudah terpasang:

```bash
git --version
node -v
```

### 1.2 Atur identitas Git

Gunakan email yang sama dengan akun GitHub-mu, supaya commit tercatat atas namamu.

```bash
git config --global user.name "Nama Kamu"
git config --global user.email "email-github-kamu@example.com"
```

### 1.3 Terima undangan repo

Cek email atau notifikasi GitHub, lalu klik **Accept invitation**. Bisa juga buka langsung:
https://github.com/WilbertFE/pmo-tbc/invitations

### 1.4 Clone repo ke laptop

Pindah ke folder tempat kamu biasa menyimpan project, lalu:

```bash
git clone https://github.com/WilbertFE/pmo-tbc.git
cd pmo-tbc
npm install
```

Saat pertama kali push nanti, akan muncul jendela login GitHub di browser. Login saja, dan Git akan mengingatnya.

### 1.5 Siapkan environment variables

```bash
cp .env.example .env.local
```

Buka `.env.local`, lalu isi nilainya. Nilainya diminta ke Kapten lewat chat pribadi, jangan di grup.

### 1.6 Jalankan aplikasi

```bash
npm run dev
```

Buka http://localhost:3000. Aplikasi pasien ada di `/pasien`, dashboard nakes di `/nakes`.

---

## 2. Rutinitas harian (setiap mulai coding)

### 2.1 Ambil kode terbaru

```bash
git checkout main
git pull
npm install
```

`npm install` perlu dijalankan kalau ada library baru yang ditambahkan anggota lain. Kalau ragu, jalankan saja; tidak ada ruginya.

### 2.2 Pilih tugas dari board

1. Buka GitHub Projects tim.
2. Ambil issue yang ditugaskan ke kamu, catat nomornya (misalnya `#12`).
3. Geser kartunya ke kolom **In Progress**.

### 2.3 Buat branch baru untuk tugas itu

```bash
git checkout -b feat/pasien-checkin
```

Format nama branch:

| Awalan | Untuk |
| --- | --- |
| `feat/` | Fitur baru |
| `fix/` | Perbaikan bug |
| `docs/` | Dokumentasi |
| `refactor/` | Merapikan kode tanpa mengubah fungsi |
| `chore/` | Setup, konfigurasi, library |

Satu branch untuk satu tugas. Jangan campur beberapa fitur dalam satu branch.

### 2.4 Melanjutkan branch dari hari sebelumnya

Kalau kamu melanjutkan branch yang belum selesai, gabungkan dulu kode terbaru dari `main` ke branch-mu:

```bash
git checkout main
git pull
git checkout feat/pasien-checkin
git merge main
```

Gunakan `merge`, bukan `rebase`. Rebase membutuhkan force push, dan force push diblokir di repo ini.

---

## 3. Selama coding

### 3.1 Simpan progres dengan commit

Commit kecil dan sering lebih baik daripada satu commit raksasa di akhir.

```bash
git status
git add src/app/pasien/page.tsx src/app/pasien/components/
git commit -m "feat(pasien): add check-in button"
```

Selalu cek `git status` sebelum `git add`, supaya tidak ada file yang tidak sengaja ikut (misalnya `.env.local`).

Format pesan commit:

```
feat(pasien): add video upload
fix(nakes): correct status color for red patients
docs: update setup guide
```

### 3.2 Kirim ke GitHub

Pertama kali push branch baru:

```bash
git push -u origin HEAD
```

Push berikutnya di branch yang sama cukup:

```bash
git push
```

---

## 4. Membuat pull request

### 4.1 Buka PR

1. Setelah push, buka repo di GitHub. Biasanya muncul banner kuning **Compare & pull request**; klik itu.
2. Pastikan **base: `main`** dan **compare: branch kamu**.
3. Judul: pakai format commit, misalnya `feat(pasien): add video check-in`.
4. Isi deskripsi dengan template di bawah.
5. Di panel kanan, isi **Reviewers** dengan anggota yang disepakati.
6. Klik **Create pull request**.
7. Geser kartu issue ke kolom **Review**.

Template deskripsi PR:

```markdown
## Apa yang diubah
- ...

## Kenapa
- ...

## Cara mengetes
1. Buka link preview Vercel di PR ini
2. ...

## Screenshot
(tempel screenshot kalau ada perubahan tampilan)

Closes #12
```

Tulisan `Closes #12` membuat issue nomor 12 otomatis tertutup saat PR di-merge.

### 4.2 Cek preview Vercel

Beberapa saat setelah PR dibuat, Vercel menambahkan komentar berisi **link preview**. Buka link itu dan pastikan fitur berjalan di versi online, bukan hanya di laptopmu.

### 4.3 Kalau ada revisi dari reviewer

Tidak perlu membuat PR baru. Perbaiki di branch yang sama, lalu:

```bash
git add <file>
git commit -m "fix(pasien): address review comments"
git push
```

PR otomatis ter-update.

---

## 5. Mereview PR teman

1. Buka PR, klik tab **Files changed**.
2. Beri komentar di baris kode yang perlu diperbaiki (klik ikon **+** di samping nomor baris).
3. Buka link preview Vercel dan coba fiturnya.
4. Klik **Review changes**, lalu pilih:
   - **Approve** kalau sudah oke
   - **Request changes** kalau ada yang harus diperbaiki
   - **Comment** kalau hanya pertanyaan atau saran

Pembuat PR tidak bisa meng-approve PR-nya sendiri.

Pasangan review:

| Pembuat PR | Reviewer |
| --- | --- |
| Programmer 2 | Programmer 3 atau Kapten |
| Programmer 3 | Programmer 2 atau Kapten |
| Kapten | Programmer 2 atau Programmer 3 |

Usahakan review PR teman di hari yang sama, supaya tidak ada yang tertahan.

---

## 6. Merge dan bersih-bersih

Setelah PR di-approve:

1. Klik **Squash and merge**, lalu **Confirm**.
2. Klik **Delete branch** di GitHub.
3. Di laptop, kembali ke `main` dan hapus branch lama:

```bash
git checkout main
git pull
git branch -D feat/pasien-checkin
```

Gunakan `-D` (huruf besar). Karena PR di-merge dengan squash, Git kadang menganggap branch belum ter-merge dan menolak `-d` biasa.

---

## 7. Menangani conflict

Conflict terjadi kalau kamu dan anggota lain mengubah baris yang sama. Biasanya muncul saat `git merge main`.

1. VS Code akan menandai file yang conflict. Buka filenya.
2. Di setiap bagian yang conflict, pilih:
   - **Accept Current Change**: pakai versimu
   - **Accept Incoming Change**: pakai versi dari `main`
   - **Accept Both Changes**: pakai keduanya
3. Pastikan kodenya masih masuk akal dan aplikasi tetap jalan (`npm run dev`).
4. Simpan, lalu:

```bash
git add <file-yang-conflict>
git commit -m "chore: resolve merge conflict"
git push
```

Kalau conflict ada di file wilayah orang lain, tanya dulu ke pemiliknya sebelum memilih.

Cara mencegah conflict: pull `main` setiap hari, buat PR kecil, dan bekerja di folder wilayahmu sendiri.

---

## 8. Kerja dengan AI agent (vibecoding)

1. Sebelum membuka AI agent, jalankan rutinitas harian (bagian 2.1) dan buat branch.
2. Di awal sesi, sebutkan siapa kamu, misalnya: "Saya Programmer 2, mau mengerjakan issue #12." Agent juga akan menawarkan untuk menarik kode terbaru dari GitHub. Jawab "ya" kalau kamu belum menjalankan rutinitas harian.
3. Rujuk desain kalau ada: "Buat sesuai `docs/design/pasien-02-checkin.png`."
4. Sebelum membuka PR, **baca dulu perubahan yang dibuat AI** di tab Source Control VS Code. Kamu tetap bertanggung jawab atas kode yang kamu kirim.
5. AI boleh commit dan push ke branch, tapi **PR dibuka dan di-merge oleh manusia**.

---

## 9. Khusus desainer: upload desain tanpa Git

Desainer tidak perlu memasang Git. Upload PNG langsung dari browser:

1. Buka repo di GitHub, masuk ke folder `docs/design`.
2. Klik **Add file → Upload files**.
3. Seret file PNG ke halaman. Beri nama dengan format `pasien-02-checkin.png` atau `nakes-01-daftar-pasien.png`.
4. Di bagian bawah, pilih **Create a new branch for this commit and start a pull request**.
5. Klik **Propose changes**, lalu **Create pull request**.

Kalau mengganti desain lama, upload file dengan nama yang sama persis supaya file lama tertimpa.

---

## 10. Perintah penyelamat

| Situasi | Perintah |
| --- | --- |
| Lihat file apa saja yang berubah | `git status` |
| Lihat riwayat commit singkat | `git log --oneline` |
| Batalkan perubahan di satu file (belum di-commit) | `git restore <file>` |
| Simpan perubahan sementara untuk pindah branch | `git stash` |
| Kembalikan perubahan yang di-stash | `git stash pop` |
| Cek sedang di branch mana | `git branch` |
| Tidak sengaja commit di `main` (belum di-push) | `git branch feat/nama-baru` lalu `git reset --hard origin/main`, lalu `git checkout feat/nama-baru` |

Untuk situasi terakhir, perintah `reset --hard` menghapus perubahan di `main` lokal, tapi commit-mu sudah aman tersimpan di branch baru. Kalau ragu, tanya Kapten dulu sebelum menjalankannya.

---

## Ringkasan cepat

```bash
# Mulai hari
git checkout main
git pull
npm install
git checkout -b feat/nama-tugas

# Selama coding
git status
git add <file>
git commit -m "feat(scope): pesan"
git push -u origin HEAD     # push pertama
git push                    # push berikutnya

# Setelah PR di-merge
git checkout main
git pull
git branch -D feat/nama-tugas
```