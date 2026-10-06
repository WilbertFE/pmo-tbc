import { selisihHari, tanggalWIB } from "./tanggal";

export type Progres = {
  hariKe: number;
  durasiHari: number;
  persen: number;
  belumMulai: boolean;
  selesai: boolean;
};

// Progres pengobatan: hari_ke = (hari ini WIB - tanggal_mulai) + 1, maksimal durasi_hari.
// Contoh tampilan: `Hari ke-${hariKe} dari ${durasiHari}`
export function hitungProgres(
  tanggalMulai: string,
  durasiHari: number,
  hariIni: string = tanggalWIB(),
): Progres {
  const hariKeMentah = selisihHari(tanggalMulai, hariIni) + 1;
  const hariKe = Math.min(Math.max(hariKeMentah, 0), durasiHari);

  return {
    hariKe,
    durasiHari,
    persen: durasiHari > 0 ? Math.round((hariKe / durasiHari) * 100) : 0,
    belumMulai: hariKeMentah < 1,
    selesai: hariKeMentah >= durasiHari,
  };
}
