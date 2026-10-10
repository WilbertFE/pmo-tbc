-- Login Google (provider bawaan Supabase) menyimpan nama di user_metadata.full_name atau name,
-- bukan di user_metadata.nama seperti form daftar. Perbarui trigger agar nama ikut terisi.
-- Peran tetap diambil dari raw_app_meta_data (default 'pasien'), sehingga pendaftaran mandiri
-- lewat form maupun Google tidak pernah menjadi nakes.

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
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'nama'), ''),
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
      split_part(new.email, '@', 1)
    ),
    coalesce(new.raw_app_meta_data ->> 'peran', 'pasien')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
