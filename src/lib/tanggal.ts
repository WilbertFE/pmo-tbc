// Helper tanggal dan jam dalam zona Asia/Jakarta (WIB).
// Database berjalan di UTC, jadi "hari ini" pasien selalu dihitung di sini
// lalu dikirim eksplisit ke database. Format tanggal: "YYYY-MM-DD" (sama dengan kolom date).

const ZONA_WIB = "Asia/Jakarta";
const MS_PER_HARI = 24 * 60 * 60 * 1000;

const formatTanggal = new Intl.DateTimeFormat("en-CA", {
  timeZone: ZONA_WIB,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const formatJam = new Intl.DateTimeFormat("en-GB", {
  timeZone: ZONA_WIB,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

// Tanggal WIB dari sebuah waktu, contoh "2026-10-14"
export function tanggalWIB(waktu: Date = new Date()): string {
  return formatTanggal.format(waktu);
}

// Jam WIB dari sebuah waktu, contoh "07:30:00" (format sama dengan kolom time)
export function jamWIB(waktu: Date = new Date()): string {
  return formatJam.format(waktu);
}

// Ubah "YYYY-MM-DD" ke jumlah hari sejak epoch, supaya selisihnya bebas zona waktu
function keNomorHari(tanggal: string): number {
  const [tahun, bulan, hari] = tanggal.split("-").map(Number);
  return Date.UTC(tahun, bulan - 1, hari) / MS_PER_HARI;
}

// Selisih hari kalender: selisihHari("2026-10-01", "2026-10-03") = 2
export function selisihHari(dari: string, sampai: string): number {
  return keNomorHari(sampai) - keNomorHari(dari);
}

// Geser tanggal sejumlah hari: tambahHari("2026-10-31", 1) = "2026-11-01"
export function tambahHari(tanggal: string, jumlah: number): string {
  const ms = (keNomorHari(tanggal) + jumlah) * MS_PER_HARI;
  return new Date(ms).toISOString().slice(0, 10);
}

// Ubah tanggal + jam WIB menjadi Date, contoh ("2026-10-14", "07:00:00")
export function waktuWIB(tanggal: string, jam: string): Date {
  const jamLengkap = jam.length === 5 ? `${jam}:00` : jam;
  return new Date(`${tanggal}T${jamLengkap}+07:00`);
}
