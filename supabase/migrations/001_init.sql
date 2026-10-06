-- Profil semua pengguna: pasien, PMO, atau nakes
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  nama text not null,
  peran text not null check (peran in ('pasien', 'pmo', 'nakes')),
  created_at timestamptz default now()
);

-- Data pengobatan per pasien
create table pasien (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) not null,
  pmo_id uuid references profiles(id),
  nakes_id uuid references profiles(id) not null,
  tanggal_mulai date not null,
  durasi_hari int not null default 180,
  jam_minum time not null
);

-- Check-in harian
create table checkin (
  id uuid primary key default gen_random_uuid(),
  pasien_id uuid references pasien(id) not null,
  tanggal date not null default current_date,
  media_path text,
  status text not null default 'menunggu'
    check (status in ('menunggu', 'terverifikasi', 'ditolak')),
  created_at timestamptz default now(),
  unique (pasien_id, tanggal)
);

-- Laporan efek samping
create table efek_samping (
  id uuid primary key default gen_random_uuid(),
  pasien_id uuid references pasien(id) not null,
  jenis text not null,
  tingkat text not null check (tingkat in ('ringan', 'sedang', 'berat')),
  catatan text,
  created_at timestamptz default now()
);

-- Catatan tindak lanjut nakes
create table tindak_lanjut (
  id uuid primary key default gen_random_uuid(),
  pasien_id uuid references pasien(id) not null,
  nakes_id uuid references profiles(id) not null,
  catatan text not null,
  created_at timestamptz default now()
);

-- Wajib: aktifkan Row Level Security di semua tabel
alter table profiles enable row level security;
alter table pasien enable row level security;
alter table checkin enable row level security;
alter table efek_samping enable row level security;
alter table tindak_lanjut enable row level security;