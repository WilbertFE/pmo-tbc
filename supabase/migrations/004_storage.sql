-- Bucket privat untuk video dan foto check-in.
-- Path file: {pasien_id}/{tanggal}.{ext}, contoh 8f2c.../2026-10-14.webm
-- Media hanya ditampilkan lewat signed URL berumur pendek.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'checkin-media',
  'checkin-media',
  false,
  52428800, -- 50 MB
  array['video/webm', 'video/mp4', 'video/quicktime', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Ambil pasien_id dari folder pertama path, null kalau bukan uuid
create or replace function public.pasien_id_dari_path(p_name text)
returns uuid
language sql
immutable
set search_path = ''
as $$
  select case
    when split_part(p_name, '/', 1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      then split_part(p_name, '/', 1)::uuid
  end;
$$;

create policy "media checkin: lihat milik sendiri atau pasien yang ditangani"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'checkin-media'
    and (
      public.pasien_milik_saya(public.pasien_id_dari_path(name))
      or public.pasien_tangani_saya(public.pasien_id_dari_path(name))
    )
  );

create policy "media checkin: pasien atau PMO mengunggah"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'checkin-media'
    and public.pasien_milik_saya(public.pasien_id_dari_path(name))
  );

-- Dibutuhkan untuk upload ulang dengan upsert: true
create policy "media checkin: pasien atau PMO mengganti file"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'checkin-media'
    and public.pasien_milik_saya(public.pasien_id_dari_path(name))
  )
  with check (
    bucket_id = 'checkin-media'
    and public.pasien_milik_saya(public.pasien_id_dari_path(name))
  );
