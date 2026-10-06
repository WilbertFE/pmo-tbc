-- Policy Row Level Security untuk semua tabel.
-- Prinsip: pasien dan PMO hanya melihat data pasiennya sendiri,
-- nakes hanya melihat pasien yang ia tangani (pasien.nakes_id).

-- ============================================================
-- Fungsi bantu
-- security definer supaya policy tidak saling memicu RLS tabel lain.
-- ============================================================

create or replace function public.peran_saya()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select peran from public.profiles where id = (select auth.uid());
$$;

-- Pengguna adalah pasien itu sendiri atau PMO-nya
create or replace function public.pasien_milik_saya(p_pasien_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.pasien
    where id = p_pasien_id
      and (select auth.uid()) in (profile_id, pmo_id)
  );
$$;

-- Pengguna adalah nakes yang menangani pasien ini
create or replace function public.pasien_tangani_saya(p_pasien_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.pasien
    where id = p_pasien_id
      and nakes_id = (select auth.uid())
  );
$$;

-- Profil lain yang boleh dilihat: orang yang ada di baris pasien yang sama
create or replace function public.profil_terhubung(p_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.pasien
    where p_profile_id in (profile_id, pmo_id, nakes_id)
      and (select auth.uid()) in (profile_id, pmo_id, nakes_id)
  );
$$;

revoke execute on function public.peran_saya() from public, anon;
revoke execute on function public.pasien_milik_saya(uuid) from public, anon;
revoke execute on function public.pasien_tangani_saya(uuid) from public, anon;
revoke execute on function public.profil_terhubung(uuid) from public, anon;
grant execute on function public.peran_saya() to authenticated;
grant execute on function public.pasien_milik_saya(uuid) to authenticated;
grant execute on function public.pasien_tangani_saya(uuid) to authenticated;
grant execute on function public.profil_terhubung(uuid) to authenticated;

-- ============================================================
-- profiles
-- Baris baru dibuat otomatis oleh trigger (migrasi 005), bukan dari aplikasi.
-- ============================================================

create policy "profil: lihat diri sendiri dan yang terhubung"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()) or public.profil_terhubung(id));

create policy "profil: ubah nama sendiri, peran tidak boleh berubah"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()) and peran = public.peran_saya());

-- ============================================================
-- pasien
-- ============================================================

create policy "pasien: lihat jika pasien, PMO, atau nakes-nya"
  on public.pasien for select
  to authenticated
  using ((select auth.uid()) in (profile_id, pmo_id, nakes_id));

create policy "pasien: nakes mendaftarkan pasien"
  on public.pasien for insert
  to authenticated
  with check (nakes_id = (select auth.uid()) and public.peran_saya() = 'nakes');

create policy "pasien: nakes mengubah data pasiennya"
  on public.pasien for update
  to authenticated
  using (nakes_id = (select auth.uid()))
  with check (nakes_id = (select auth.uid()));

-- ============================================================
-- checkin
-- ============================================================

create policy "checkin: lihat milik sendiri atau pasien yang ditangani"
  on public.checkin for select
  to authenticated
  using (public.pasien_milik_saya(pasien_id) or public.pasien_tangani_saya(pasien_id));

create policy "checkin: pasien atau PMO membuat check-in"
  on public.checkin for insert
  to authenticated
  with check (public.pasien_milik_saya(pasien_id) and status = 'menunggu');

-- Ulang check-in di hari yang sama (misalnya setelah ditolak) kembali ke status menunggu
create policy "checkin: pasien atau PMO mengulang check-in yang belum diverifikasi"
  on public.checkin for update
  to authenticated
  using (public.pasien_milik_saya(pasien_id) and status in ('menunggu', 'ditolak'))
  with check (public.pasien_milik_saya(pasien_id) and status = 'menunggu');

create policy "checkin: nakes memverifikasi"
  on public.checkin for update
  to authenticated
  using (public.pasien_tangani_saya(pasien_id))
  with check (public.pasien_tangani_saya(pasien_id));

-- ============================================================
-- efek_samping
-- ============================================================

create policy "efek samping: lihat milik sendiri atau pasien yang ditangani"
  on public.efek_samping for select
  to authenticated
  using (public.pasien_milik_saya(pasien_id) or public.pasien_tangani_saya(pasien_id));

create policy "efek samping: pasien atau PMO melapor"
  on public.efek_samping for insert
  to authenticated
  with check (public.pasien_milik_saya(pasien_id));

-- ============================================================
-- tindak_lanjut (catatan internal nakes, tidak terlihat oleh pasien)
-- ============================================================

create policy "tindak lanjut: nakes melihat catatan pasiennya"
  on public.tindak_lanjut for select
  to authenticated
  using (public.pasien_tangani_saya(pasien_id));

create policy "tindak lanjut: nakes menulis catatan"
  on public.tindak_lanjut for insert
  to authenticated
  with check (nakes_id = (select auth.uid()) and public.pasien_tangani_saya(pasien_id));

-- ============================================================
-- Index untuk kolom yang dipakai policy dan dashboard
-- ============================================================

create index if not exists pasien_profile_id_idx on public.pasien (profile_id);
create index if not exists pasien_pmo_id_idx on public.pasien (pmo_id);
create index if not exists pasien_nakes_id_idx on public.pasien (nakes_id);
create index if not exists efek_samping_pasien_created_idx on public.efek_samping (pasien_id, created_at desc);
create index if not exists tindak_lanjut_pasien_created_idx on public.tindak_lanjut (pasien_id, created_at desc);
