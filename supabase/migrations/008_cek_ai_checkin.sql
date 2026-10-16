-- Hasil cek awal bukti check-in oleh AI (Gemini). Hanya saran untuk nakes, keputusan tetap di nakes.
-- Tabel terpisah dari checkin supaya pasien tidak bisa mengubah hasilnya:
-- policy update checkin mengizinkan pasien mengedit baris yang masih menunggu.

create table if not exists public.cek_ai_checkin (
  checkin_id uuid primary key references public.checkin (id) on delete cascade,
  pasien_id uuid not null references public.pasien (id) on delete cascade,
  -- Media yang dinilai. Kalau pasien mengirim ulang bukti, path berubah dan hasil lama dianggap basi.
  media_path text not null,
  saran text not null check (saran in ('kemungkinan_valid', 'perlu_dicek', 'kemungkinan_tidak_valid')),
  wajah_terlihat boolean not null,
  obat_terlihat boolean not null,
  menelan_terlihat boolean not null,
  alasan text not null,
  model text not null,
  created_at timestamptz not null default now()
);

alter table public.cek_ai_checkin enable row level security;

-- Hanya nakes yang menangani pasien. Pasien dan PMO tidak punya akses sama sekali.
create policy "cek ai: nakes melihat hasil pasiennya"
  on public.cek_ai_checkin for select
  to authenticated
  using (public.pasien_tangani_saya(pasien_id));

create policy "cek ai: nakes menyimpan hasil"
  on public.cek_ai_checkin for insert
  to authenticated
  with check (public.pasien_tangani_saya(pasien_id));

create policy "cek ai: nakes memperbarui hasil"
  on public.cek_ai_checkin for update
  to authenticated
  using (public.pasien_tangani_saya(pasien_id))
  with check (public.pasien_tangani_saya(pasien_id));
