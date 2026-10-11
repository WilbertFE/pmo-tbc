import { selisihHari, tanggalWIB, waktuWIB } from "./tanggal";

export type TingkatEfekSamping = "ringan" | "sedang" | "berat";
export type StatusPeringatan = "merah" | "kuning" | "hijau";

export interface DataEfekSampingRingkas {
  tingkat: TingkatEfekSamping;
  tanggal: string; // Format "YYYY-MM-DD"
}

export interface InputStatusPasien {
  jamMinum: string; // Format "HH:mm" atau "HH:mm:ss"
  sudahCheckInHariIni: boolean;
  sudahCheckInKemarin: boolean;
  daftarEfekSampingTerakhir?: DataEfekSampingRingkas[];
  // Masa pengobatan. Hari di luar masa ini tidak dihitung sebagai tidak check-in.
  tanggalMulai?: string; // Format "YYYY-MM-DD"
  durasiHari?: number;
  // Parameter waktu opsional untuk memudahkan pengujian (unit testing)
  waktuSekarang?: Date;
  tanggalHariIni?: string;
}

export interface HasilStatusPasien {
  status: StatusPeringatan;
  alasan: string[];
  keterangan: string;
}

// Logika Early Warning System sesuai spesifikasi AGENTS.md:
// - Merah: Tidak check-in 2 hari berturut-turut (kemarin, dan hari ini setelah lewat jam_minum),
//          atau ada efek samping tingkat berat dalam 3 hari terakhir.
// - Kuning: Belum check-in hari ini dan lebih dari 2 jam lewat jam_minum,
//           atau ada efek samping tingkat sedang dalam 3 hari terakhir.
// - Hijau: Sudah check-in hari ini dan tidak merah atau kuning (atau kondisi normal).
// Jika merah dan kuning sama-sama terpenuhi, gunakan merah.
// Hari sebelum tanggalMulai dan setelah durasiHari tidak dihitung sebagai tidak check-in.
export function tentukanStatusPasien(input: InputStatusPasien): HasilStatusPasien {
  const sekarang = input.waktuSekarang ?? new Date();
  const hariIni = input.tanggalHariIni ?? tanggalWIB(sekarang);

  const targetWaktuMinum = waktuWIB(hariIni, input.jamMinum);
  const targetWaktuMinumPlus2Jam = new Date(targetWaktuMinum.getTime() + 2 * 60 * 60 * 1000);

  const sudahLewatJamMinum = sekarang.getTime() >= targetWaktuMinum.getTime();
  const sudahLewat2JamMinum = sekarang.getTime() >= targetWaktuMinumPlus2Jam.getTime();

  // 0. Di luar masa pengobatan: belum mulai atau sudah selesai, tidak ada kewajiban check-in
  if (input.tanggalMulai) {
    const hariKe = selisihHari(input.tanggalMulai, hariIni) + 1;
    if (hariKe < 1) {
      return {
        status: "hijau",
        alasan: ["Pengobatan belum dimulai"],
        keterangan: "Belum mulai",
      };
    }
    if (input.durasiHari !== undefined && hariKe > input.durasiHari) {
      return {
        status: "hijau",
        alasan: ["Masa pengobatan sudah selesai"],
        keterangan: "Pengobatan selesai",
      };
    }
  }

  // Kemarin hanya dihitung kalau sudah termasuk masa pengobatan (bukan hari pertama)
  const kemarinTermasukMasaPengobatan =
    !input.tanggalMulai || selisihHari(input.tanggalMulai, hariIni) >= 1;

  const alasan: string[] = [];
  let isMerah = false;
  let isKuning = false;

  // 1. Evaluasi Efek Samping (dalam 3 hari terakhir: H, H-1, H-2)
  if (input.daftarEfekSampingTerakhir && input.daftarEfekSampingTerakhir.length > 0) {
    for (const item of input.daftarEfekSampingTerakhir) {
      const bedaHari = selisihHari(item.tanggal, hariIni);
      if (bedaHari >= 0 && bedaHari <= 2) {
        if (item.tingkat === "berat") {
          isMerah = true;
          alasan.push("Ada efek samping berat dalam 3 hari terakhir");
        } else if (item.tingkat === "sedang") {
          isKuning = true;
          alasan.push("Ada efek samping sedang dalam 3 hari terakhir");
        }
      }
    }
  }

  // 2. Evaluasi Kepatuhan Check-in
  if (!input.sudahCheckInHariIni) {
    // Cek kondisi Merah: tidak check-in kemarin dan hari ini setelah lewat jam_minum
    if (!input.sudahCheckInKemarin && kemarinTermasukMasaPengobatan && sudahLewatJamMinum) {
      isMerah = true;
      alasan.push("Tidak check-in 2 hari berturut-turut");
    }

    // Cek kondisi Kuning: belum check-in hari ini dan lebih dari 2 jam lewat jam_minum
    if (sudahLewat2JamMinum) {
      isKuning = true;
      alasan.push("Belum check-in, terlambat lebih dari 2 jam dari jadwal minum obat");
    }
  }

  // Penentuan Status Final
  if (isMerah) {
    return {
      status: "merah",
      alasan,
      keterangan: "Perlu perhatian segera",
    };
  }

  if (isKuning) {
    return {
      status: "kuning",
      alasan,
      keterangan: "Perlu pemantauan",
    };
  }

  return {
    status: "hijau",
    alasan: input.sudahCheckInHariIni ? ["Sudah check-in hari ini"] : ["Jadwal obat terpantau aman"],
    keterangan: input.sudahCheckInHariIni ? "Sudah minum obat" : "Terkendali",
  };
}

// Fungsi bantu untuk mengurutkan pasien: Merah paling atas, lalu Kuning, lalu Hijau
export function urutkanPrioritasPasien<T extends { status: StatusPeringatan }>(daftar: T[]): T[] {
  const bobot: Record<StatusPeringatan, number> = {
    merah: 0,
    kuning: 1,
    hijau: 2,
  };

  return [...daftar].sort((a, b) => bobot[a.status] - bobot[b.status]);
}
