-- Data demo untuk development dan presentasi. JANGAN dijalankan di database produksi berisi data asli.
-- Jalankan setelah semua migrasi. Aman dijalankan ulang (data yang sudah ada dilewati).
--
-- Semua akun memakai password: demo1234
--   nakes@demo.id    Bu Sari (nakes)
--   budi@demo.id     Pak Budi (pasien, rutin check-in: status hijau)
--   ani@demo.id      Ani (PMO untuk Pak Budi)
--   wati@demo.id     Bu Wati (pasien, 2 hari tidak check-in: status merah)
--   joko@demo.id     Pak Joko (pasien, efek samping sedang: status kuning)

-- 1. Akun auth. Trigger saat_user_baru (migrasi 005) otomatis membuat baris profiles.
with akun (id, email, nama, peran) as (
  values
    ('11111111-1111-4111-8111-111111111111'::uuid, 'nakes@demo.id', 'Bu Sari', 'nakes'),
    ('22222222-2222-4222-8222-222222222201'::uuid, 'budi@demo.id', 'Pak Budi', 'pasien'),
    ('33333333-3333-4333-8333-333333333301'::uuid, 'ani@demo.id', 'Ani', 'pmo'),
    ('22222222-2222-4222-8222-222222222202'::uuid, 'wati@demo.id', 'Bu Wati', 'pasien'),
    ('22222222-2222-4222-8222-222222222203'::uuid, 'joko@demo.id', 'Pak Joko', 'pasien')
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
where u.email like '%@demo.id'
  and not exists (select 1 from auth.identities i where i.user_id = u.id and i.provider = 'email');

-- 2. Data pengobatan. Tanggal relatif terhadap hari ini WIB.
with hari_ini as (select (now() at time zone 'Asia/Jakarta')::date as tgl)
insert into public.pasien (id, profile_id, pmo_id, nakes_id, tanggal_mulai, durasi_hari, jam_minum)
select v.id, v.profile_id, v.pmo_id, '11111111-1111-4111-8111-111111111111', h.tgl - v.mulai_hari_lalu, 180, v.jam_minum
from hari_ini h,
  (values
    ('aaaaaaaa-0000-4000-8000-000000000001'::uuid, '22222222-2222-4222-8222-222222222201'::uuid, '33333333-3333-4333-8333-333333333301'::uuid, 46, '07:00'::time),
    ('aaaaaaaa-0000-4000-8000-000000000002'::uuid, '22222222-2222-4222-8222-222222222202'::uuid, null::uuid, 20, '07:00'::time),
    ('aaaaaaaa-0000-4000-8000-000000000003'::uuid, '22222222-2222-4222-8222-222222222203'::uuid, null::uuid, 90, '19:00'::time)
  ) as v (id, profile_id, pmo_id, mulai_hari_lalu, jam_minum)
on conflict (id) do nothing;

-- 3. Riwayat check-in 7 hari terakhir (tanpa file media).
--    Pak Budi: lengkap sampai hari ini. Bu Wati: berhenti 2 hari lalu. Pak Joko: sampai kemarin.
with hari_ini as (select (now() at time zone 'Asia/Jakarta')::date as tgl)
insert into public.checkin (pasien_id, tanggal, status)
select v.pasien_id, h.tgl - g.n, case when g.n = 0 then 'menunggu' else 'terverifikasi' end
from hari_ini h,
  (values
    ('aaaaaaaa-0000-4000-8000-000000000001'::uuid, 0),
    ('aaaaaaaa-0000-4000-8000-000000000002'::uuid, 2),
    ('aaaaaaaa-0000-4000-8000-000000000003'::uuid, 1)
  ) as v (pasien_id, mulai_n),
  generate_series(0, 6) as g (n)
where g.n >= v.mulai_n
on conflict (pasien_id, tanggal) do nothing;

-- 4. Efek samping: Pak Joko melapor mual tingkat sedang kemarin.
insert into public.efek_samping (pasien_id, jenis, tingkat, catatan, created_at)
select 'aaaaaaaa-0000-4000-8000-000000000003', 'Mual', 'sedang', 'Mual setelah minum obat malam', now() - interval '1 day'
where not exists (
  select 1 from public.efek_samping where pasien_id = 'aaaaaaaa-0000-4000-8000-000000000003'
);
