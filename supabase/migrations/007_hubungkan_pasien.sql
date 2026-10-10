-- Nakes menghubungkan akun yang sudah mendaftar sendiri (form /daftar atau Google)
-- ke data pengobatan baru, opsional sekaligus menunjuk PMO.
--
-- Kenapa lewat fungsi: RLS tidak mengizinkan nakes melihat profil yang belum terhubung
-- dengannya, dan email ada di auth.users yang tidak bisa dibaca aplikasi. Fungsi ini
-- hanya mencari berdasarkan email persis (bukan daftar semua akun), dan hanya bisa
-- dipanggil nakes. Pesan error ditulis untuk langsung ditampilkan di UI (errcode P0001).

create or replace function public.hubungkan_pasien(
  p_email text,
  p_tanggal_mulai date,
  p_jam_minum time,
  p_durasi_hari int default 180,
  p_email_pmo text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_nakes uuid := (select auth.uid());
  v_email text := lower(trim(p_email));
  v_email_pmo text := nullif(lower(trim(coalesce(p_email_pmo, ''))), '');
  v_profil uuid;
  v_peran text;
  v_pmo uuid;
  v_peran_pmo text;
  v_pasien uuid;
begin
  if v_nakes is null or public.peran_saya() is distinct from 'nakes' then
    raise exception 'Hanya petugas nakes yang bisa menambah pasien.' using errcode = 'P0001';
  end if;

  if p_tanggal_mulai is null or p_jam_minum is null then
    raise exception 'Tanggal mulai dan jam minum obat wajib diisi.' using errcode = 'P0001';
  end if;

  if p_durasi_hari is null or p_durasi_hari < 1 or p_durasi_hari > 730 then
    raise exception 'Durasi pengobatan harus antara 1 dan 730 hari.' using errcode = 'P0001';
  end if;

  -- Akun pasien
  select u.id, p.peran into v_profil, v_peran
  from auth.users u
  join public.profiles p on p.id = u.id
  where lower(u.email) = v_email;

  if v_profil is null then
    raise exception 'Akun dengan email ini belum terdaftar. Minta pasien mendaftar dulu di halaman Daftar.'
      using errcode = 'P0001';
  end if;

  if v_peran <> 'pasien' then
    raise exception 'Akun ini terdaftar sebagai %, bukan pasien.', v_peran using errcode = 'P0001';
  end if;

  if exists (select 1 from public.pasien where profile_id = v_profil) then
    raise exception 'Akun ini sudah terhubung dengan data pengobatan.' using errcode = 'P0001';
  end if;

  -- PMO (opsional). Akun PMO juga mendaftar sendiri dulu, lalu perannya diubah menjadi pmo di sini.
  if v_email_pmo is not null then
    if v_email_pmo = v_email then
      raise exception 'Email PMO tidak boleh sama dengan email pasien.' using errcode = 'P0001';
    end if;

    select u.id, p.peran into v_pmo, v_peran_pmo
    from auth.users u
    join public.profiles p on p.id = u.id
    where lower(u.email) = v_email_pmo;

    if v_pmo is null then
      raise exception 'Akun PMO dengan email ini belum terdaftar. Minta PMO mendaftar dulu di halaman Daftar.'
        using errcode = 'P0001';
    end if;

    if v_peran_pmo = 'nakes' then
      raise exception 'Akun PMO ini terdaftar sebagai nakes.' using errcode = 'P0001';
    end if;

    if v_peran_pmo = 'pasien' then
      if exists (select 1 from public.pasien where profile_id = v_pmo) then
        raise exception 'Akun PMO ini adalah pasien yang sedang berobat.' using errcode = 'P0001';
      end if;
      update public.profiles set peran = 'pmo' where id = v_pmo;
    end if;
  end if;

  insert into public.pasien (profile_id, pmo_id, nakes_id, tanggal_mulai, durasi_hari, jam_minum)
  values (v_profil, v_pmo, v_nakes, p_tanggal_mulai, p_durasi_hari, p_jam_minum)
  returning id into v_pasien;

  return v_pasien;
end;
$$;

revoke execute on function public.hubungkan_pasien(text, date, time, int, text) from public, anon;
grant execute on function public.hubungkan_pasien(text, date, time, int, text) to authenticated;
