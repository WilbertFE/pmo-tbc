-- 1. Profil dibuat otomatis setiap ada akun baru di auth.users.
--    Peran diambil dari raw_app_meta_data (hanya bisa diisi admin/dashboard),
--    bukan dari user_metadata, supaya orang tidak bisa mendaftar sendiri sebagai nakes.
--    Nama diambil dari user_metadata.nama, kalau kosong pakai bagian depan email.

create or replace function public.buat_profil_baru()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, nama, peran)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'nama', ''), split_part(new.email, '@', 1)),
    coalesce(new.raw_app_meta_data ->> 'peran', 'pasien')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger saat_user_baru
  after insert on auth.users
  for each row execute function public.buat_profil_baru();

-- 2. Hapus default current_date di checkin.tanggal.
--    current_date di database memakai UTC, sehingga check-in jam 00.00 sampai 07.00 WIB
--    akan tercatat di tanggal kemarin. Aplikasi wajib mengirim tanggal WIB (src/lib/tanggal.ts).

alter table public.checkin alter column tanggal drop default;
