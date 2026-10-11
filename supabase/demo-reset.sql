-- Reset data demo supaya statusnya pas untuk presentasi. Jalankan di SQL Editor Supabase
-- (misalnya pagi hari sebelum demo). Aman dijalankan berulang kali.
-- Hanya menyentuh akun @demo.id. Akun asli tidak disentuh.
-- Butuh: migrasi 001 sampai 007 dan supabase/seed.sql sudah pernah dijalankan.
--
-- Status dihitung dari jam minum obat, jadi lakukan demo SETELAH pukul 09.00 WIB.
-- Sebelum jam itu, pasien yang belum check-in belum terhitung terlambat.
--
-- Hasil (dihitung dari hari ini WIB):
--   Pak Budi   : rutin check-in, hari ini sudah check-in (menunggu verifikasi) -> hijau
--   Bu Wati    : 2 hari terakhir tidak check-in -> merah
--   Pak Joko   : check-in sampai kemarin, efek samping sedang kemarin -> kuning
--   Bu Rina    : pasien milik nakes kedua (nakes2@demo.id), tidak terlihat oleh Bu Sari
--
-- Akun baru dari skrip ini (password demo1234):
--   nakes2@demo.id  Pak Andi (nakes kedua)
--   rina@demo.id    Bu Rina (pasien Pak Andi)

-- 1. Akun nakes kedua dan pasiennya (dilewati bila sudah ada)
with akun (id, email, nama, peran) as (
  values
    ('11111111-1111-4111-8111-111111111112'::uuid, 'nakes2@demo.id', 'Pak Andi', 'nakes'),
    ('22222222-2222-4222-8222-222222222204'::uuid, 'rina@demo.id', 'Bu Rina', 'pasien')
)
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
)
select
  '00000000-0000-0000-0000-000000000000', id, 'authenticated', 'authenticated', email,
  extensions.crypt('demo1234', extensions.gen_salt('bf')), now(),
  jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email'), 'peran', peran),
  jsonb_build_object('nama', nama), now(), now(),
  '', '', '', ''
from akun
on conflict (id) do nothing;

insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select
  gen_random_uuid(), u.id, u.id::text,
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
  'email', now(), now(), now()
from auth.users u
where u.email in ('nakes2@demo.id', 'rina@demo.id')
  and not exists (select 1 from auth.identities i where i.user_id = u.id and i.provider = 'email');

insert into public.pasien (id, profile_id, pmo_id, nakes_id, tanggal_mulai, durasi_hari, jam_minum)
values (
  'aaaaaaaa-0000-4000-8000-000000000004',
  '22222222-2222-4222-8222-222222222204',
  null,
  '11111111-1111-4111-8111-111111111112',
  (now() at time zone 'Asia/Jakarta')::date - 30,
  180,
  '08:00'
)
on conflict (id) do nothing;

-- 2. Hapus check-in dan efek samping lama milik pasien demo
delete from public.checkin
where pasien_id in (
  'aaaaaaaa-0000-4000-8000-000000000001',
  'aaaaaaaa-0000-4000-8000-000000000002',
  'aaaaaaaa-0000-4000-8000-000000000003',
  'aaaaaaaa-0000-4000-8000-000000000004'
);

delete from public.efek_samping
where pasien_id in (
  'aaaaaaaa-0000-4000-8000-000000000001',
  'aaaaaaaa-0000-4000-8000-000000000002',
  'aaaaaaaa-0000-4000-8000-000000000003',
  'aaaaaaaa-0000-4000-8000-000000000004'
);

-- 3. Check-in 14 hari terakhir (supaya grafik kepatuhan juga terisi)
--    mulai_n = hari terakhir check-in dihitung mundur dari hari ini (0 = hari ini)
--    lompat = hari yang sengaja dikosongkan agar grafik tidak rata 100%
with hari_ini as (select (now() at time zone 'Asia/Jakarta')::date as tgl),
rencana (pasien_id, mulai_n, lompat) as (
  values
    ('aaaaaaaa-0000-4000-8000-000000000001'::uuid, 0, array[9]),
    ('aaaaaaaa-0000-4000-8000-000000000002'::uuid, 2, array[6, 11]),
    ('aaaaaaaa-0000-4000-8000-000000000003'::uuid, 1, array[4]),
    ('aaaaaaaa-0000-4000-8000-000000000004'::uuid, 0, array[]::int[])
)
insert into public.checkin (pasien_id, tanggal, status, created_at)
select
  r.pasien_id,
  h.tgl - g.n,
  case when g.n = 0 then 'menunggu' else 'terverifikasi' end,
  -- Jam unggah realistis: sekitar jam minum obat (07.00 sampai 08.30 WIB)
  ((h.tgl - g.n) + time '07:00' + (g.n % 4) * interval '20 minutes') at time zone 'Asia/Jakarta'
from hari_ini h
cross join rencana r
cross join generate_series(0, 13) as g (n)
where g.n >= r.mulai_n
  and not (g.n = any (r.lompat))
on conflict (pasien_id, tanggal) do nothing;

-- 4. Efek samping: Pak Joko mual tingkat sedang kemarin
insert into public.efek_samping (pasien_id, jenis, tingkat, catatan, created_at)
values (
  'aaaaaaaa-0000-4000-8000-000000000003',
  'Mual',
  'sedang',
  'Mual setelah minum obat malam',
  now() - interval '1 day'
);
