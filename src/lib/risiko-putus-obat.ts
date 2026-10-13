import { jamWIB, selisihHari, tambahHari, tanggalWIB, waktuWIB } from "./tanggal";

// Skor risiko putus obat 0-100 dari pola 14 hari terakhir.
// Sengaja berbasis aturan (bukan AI) supaya konsisten, bisa diuji, dan mudah dijelaskan ke nakes.

export type LevelRisiko = "rendah" | "sedang" | "tinggi";

export type FaktorRisiko = { poin: number; alasan: string };

export type HasilRisiko = {
  skor: number;
  level: LevelRisiko;
  faktor: FaktorRisiko[];
  dataCukup: boolean;
};

export type InputRisiko = {
  tanggalHariIni: string; // "YYYY-MM-DD" WIB
  tanggalMulai: string;
  durasiHari: number;
  jamMinum: string; // "HH:MM" atau "HH:MM:SS"
  checkin: { tanggal: string; status: "menunggu" | "terverifikasi" | "ditolak"; createdAt: string | null }[];
  efekSamping: { tingkat: "ringan" | "sedang" | "berat"; tanggal: string }[];
};

export const JENDELA_HARI = 14;
const MIN_HARI_DATA = 3;
const BATAS_TERLAMBAT_MENIT = 120;

function menitDariJam(jam: string): number {
  const [h, m] = jam.split(":").map(Number);
  return h * 60 + m;
}

export function levelDariSkor(skor: number): LevelRisiko {
  if (skor >= 60) return "tinggi";
  if (skor >= 30) return "sedang";
  return "rendah";
}

export function hitungRisikoPutusObat(input: InputRisiko): HasilRisiko {
  const hariIni = input.tanggalHariIni;
  const hariKe = selisihHari(input.tanggalMulai, hariIni) + 1;

  // Belum mulai atau sudah selesai: tidak ada risiko putus obat yang perlu dipantau
  if (hariKe < 1 || hariKe > input.durasiHari) {
    return { skor: 0, level: "rendah", faktor: [], dataCukup: false };
  }

  // Hari yang dinilai: sampai kemarin (hari ini masih berjalan), hanya dalam masa pengobatan
  const daftarHari: string[] = [];
  for (let i = 1; i <= JENDELA_HARI; i++) {
    const tanggal = tambahHari(hariIni, -i);
    if (selisihHari(input.tanggalMulai, tanggal) >= 0) daftarHari.push(tanggal);
  }

  const sahPerTanggal = new Map<string, InputRisiko["checkin"][number]>();
  let jumlahDitolak = 0;
  for (const c of input.checkin) {
    if (!daftarHari.includes(c.tanggal) && c.tanggal !== hariIni) continue;
    if (c.status === "ditolak") jumlahDitolak++;
    else sahPerTanggal.set(c.tanggal, c);
  }

  const faktor: FaktorRisiko[] = [];
  const dataCukup = daftarHari.length >= MIN_HARI_DATA;

  if (dataCukup) {
    // 1. Hari tanpa check-in yang sah
    const bolong = daftarHari.filter((t) => !sahPerTanggal.has(t)).length;
    const poinBolong = Math.round((bolong / daftarHari.length) * 40);
    if (poinBolong > 0) {
      faktor.push({ poin: poinBolong, alasan: `${bolong} dari ${daftarHari.length} hari terakhir tanpa check-in` });
    }

    // 2. Bolong berturut-turut sampai kemarin
    let beruntun = 0;
    for (const tanggal of daftarHari) {
      if (sahPerTanggal.has(tanggal)) break;
      beruntun++;
    }
    if (beruntun >= 3) faktor.push({ poin: 20, alasan: `${beruntun} hari berturut-turut tidak check-in` });
    else if (beruntun === 2) faktor.push({ poin: 10, alasan: "2 hari berturut-turut tidak check-in" });

    // 3. Check-in yang terlambat jauh dari jadwal minum
    const batasMenit = menitDariJam(input.jamMinum) + BATAS_TERLAMBAT_MENIT;
    const dinilai = daftarHari.map((t) => sahPerTanggal.get(t)).filter((c) => c?.createdAt);
    const terlambat = dinilai.filter((c) => {
      const waktu = new Date(c!.createdAt!);
      // Diunggah di hari berikutnya juga dihitung terlambat
      if (tanggalWIB(waktu) !== c!.tanggal) return waktu > waktuWIB(c!.tanggal, input.jamMinum);
      return menitDariJam(jamWIB(waktu)) > batasMenit;
    }).length;
    if (dinilai.length > 0 && terlambat > 0) {
      faktor.push({
        poin: Math.round((terlambat / dinilai.length) * 10),
        alasan: `${terlambat} check-in terlambat lebih dari 2 jam dari jadwal`,
      });
    }
  }

  // 4. Bukti ditolak (termasuk hari ini)
  if (jumlahDitolak > 0) {
    faktor.push({ poin: Math.min(jumlahDitolak * 5, 10), alasan: `${jumlahDitolak} bukti check-in ditolak` });
  }

  // 5. Efek samping dalam jendela penilaian
  const efekTerbaru = input.efekSamping.filter((e) => {
    const beda = selisihHari(e.tanggal, hariIni);
    return beda >= 0 && beda <= JENDELA_HARI;
  });
  const berat = efekTerbaru.filter((e) => e.tingkat === "berat").length;
  const sedang = efekTerbaru.filter((e) => e.tingkat === "sedang").length;
  const poinEfek = Math.min(berat * 15 + sedang * 8, 20);
  if (poinEfek > 0) {
    const bagian = [berat > 0 && `${berat} berat`, sedang > 0 && `${sedang} sedang`].filter(Boolean).join(", ");
    faktor.push({ poin: poinEfek, alasan: `Efek samping ${bagian} dalam 2 minggu terakhir` });
  }

  // 6. Fase rawan: setelah fase awal, pasien sering merasa sudah sembuh lalu berhenti
  if (hariKe >= 50 && hariKe <= 120) {
    faktor.push({ poin: 5, alasan: "Fase lanjutan, pasien sering merasa sudah sembuh" });
  }

  const skor = Math.min(
    faktor.reduce((total, f) => total + f.poin, 0),
    100,
  );
  faktor.sort((a, b) => b.poin - a.poin);

  return { skor, level: levelDariSkor(skor), faktor, dataCukup };
}
