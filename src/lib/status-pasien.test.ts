// Test suite untuk logika Early Warning Status Pasien (Vitest / Jest compatible)
import { tentukanStatusPasien, urutkanPrioritasPasien } from "./status-pasien";
import { waktuWIB } from "./tanggal";

export function jalankanPengujianStatusPasien() {
  const tanggalHariIni = "2026-10-14";
  const jamMinum = "08:00";

  // Kasus 1: Pasien sudah check-in hari ini, tanpa efek samping -> Hijau
  const kasus1 = tentukanStatusPasien({
    jamMinum,
    sudahCheckInHariIni: true,
    sudahCheckInKemarin: true,
    tanggalHariIni,
    waktuSekarang: waktuWIB(tanggalHariIni, "10:00"),
  });
  console.assert(kasus1.status === "hijau", `Kasus 1 gagal: diharapkan hijau, didapat ${kasus1.status}`);

  // Kasus 2: Belum check-in, belum lewat jam minum (jam 07:00), kemarin check-in -> Hijau
  const kasus2 = tentukanStatusPasien({
    jamMinum,
    sudahCheckInHariIni: false,
    sudahCheckInKemarin: true,
    tanggalHariIni,
    waktuSekarang: waktuWIB(tanggalHariIni, "07:00"),
  });
  console.assert(kasus2.status === "hijau", `Kasus 2 gagal: diharapkan hijau, didapat ${kasus2.status}`);

  // Kasus 3: Belum check-in, lewat 2 jam lebih (jam 10:30), kemarin check-in -> Kuning
  const kasus3 = tentukanStatusPasien({
    jamMinum,
    sudahCheckInHariIni: false,
    sudahCheckInKemarin: true,
    tanggalHariIni,
    waktuSekarang: waktuWIB(tanggalHariIni, "10:30"),
  });
  console.assert(kasus3.status === "kuning", `Kasus 3 gagal: diharapkan kuning, didapat ${kasus3.status}`);

  // Kasus 4: Efek samping sedang dalam 3 hari terakhir (meskipun sudah check-in) -> Kuning
  const kasus4 = tentukanStatusPasien({
    jamMinum,
    sudahCheckInHariIni: true,
    sudahCheckInKemarin: true,
    daftarEfekSampingTerakhir: [{ tingkat: "sedang", tanggal: "2026-10-13" }],
    tanggalHariIni,
    waktuSekarang: waktuWIB(tanggalHariIni, "09:00"),
  });
  console.assert(kasus4.status === "kuning", `Kasus 4 gagal: diharapkan kuning, didapat ${kasus4.status}`);

  // Kasus 5: Tidak check-in 2 hari berturut-turut (kemarin tidak, hari ini jam 08:30 lewat jam minum) -> Merah
  const kasus5 = tentukanStatusPasien({
    jamMinum,
    sudahCheckInHariIni: false,
    sudahCheckInKemarin: false,
    tanggalHariIni,
    waktuSekarang: waktuWIB(tanggalHariIni, "08:30"),
  });
  console.assert(kasus5.status === "merah", `Kasus 5 gagal: diharapkan merah, didapat ${kasus5.status}`);

  // Kasus 6: Efek samping berat dalam 3 hari terakhir -> Merah
  const kasus6 = tentukanStatusPasien({
    jamMinum,
    sudahCheckInHariIni: true,
    sudahCheckInKemarin: true,
    daftarEfekSampingTerakhir: [{ tingkat: "berat", tanggal: "2026-10-14" }],
    tanggalHariIni,
    waktuSekarang: waktuWIB(tanggalHariIni, "09:00"),
  });
  console.assert(kasus6.status === "merah", `Kasus 6 gagal: diharapkan merah, didapat ${kasus6.status}`);

  // Kasus 7: Merah dan Kuning sama-sama terjadi -> Prioritas Merah
  const kasus7 = tentukanStatusPasien({
    jamMinum,
    sudahCheckInHariIni: false,
    sudahCheckInKemarin: false,
    daftarEfekSampingTerakhir: [{ tingkat: "sedang", tanggal: "2026-10-14" }],
    tanggalHariIni,
    waktuSekarang: waktuWIB(tanggalHariIni, "11:00"),
  });
  console.assert(kasus7.status === "merah", `Kasus 7 gagal: diharapkan merah, didapat ${kasus7.status}`);

  // Kasus 9: Hari pertama pengobatan, belum check-in dan lewat 2 jam -> Kuning (bukan Merah),
  // karena kemarin belum termasuk masa pengobatan
  const kasus9 = tentukanStatusPasien({
    jamMinum,
    sudahCheckInHariIni: false,
    sudahCheckInKemarin: false,
    tanggalMulai: tanggalHariIni,
    durasiHari: 180,
    tanggalHariIni,
    waktuSekarang: waktuWIB(tanggalHariIni, "15:00"),
  });
  console.assert(kasus9.status === "kuning", `Kasus 9 gagal: diharapkan kuning, didapat ${kasus9.status}`);

  // Kasus 10: Hari kedua, kemarin tidak check-in dan hari ini lewat jam minum -> Merah
  const kasus10 = tentukanStatusPasien({
    jamMinum,
    sudahCheckInHariIni: false,
    sudahCheckInKemarin: false,
    tanggalMulai: "2026-10-13",
    durasiHari: 180,
    tanggalHariIni,
    waktuSekarang: waktuWIB(tanggalHariIni, "08:30"),
  });
  console.assert(kasus10.status === "merah", `Kasus 10 gagal: diharapkan merah, didapat ${kasus10.status}`);

  // Kasus 11: Pengobatan belum dimulai -> Hijau
  const kasus11 = tentukanStatusPasien({
    jamMinum,
    sudahCheckInHariIni: false,
    sudahCheckInKemarin: false,
    tanggalMulai: "2026-10-20",
    durasiHari: 180,
    tanggalHariIni,
    waktuSekarang: waktuWIB(tanggalHariIni, "15:00"),
  });
  console.assert(kasus11.status === "hijau", `Kasus 11 gagal: diharapkan hijau, didapat ${kasus11.status}`);

  // Kasus 12: Masa pengobatan sudah selesai (hari ke-181 dari 180) -> Hijau
  const kasus12 = tentukanStatusPasien({
    jamMinum,
    sudahCheckInHariIni: false,
    sudahCheckInKemarin: false,
    tanggalMulai: "2026-04-17",
    durasiHari: 180,
    tanggalHariIni,
    waktuSekarang: waktuWIB(tanggalHariIni, "15:00"),
  });
  console.assert(kasus12.status === "hijau", `Kasus 12 gagal: diharapkan hijau, didapat ${kasus12.status}`);

  // Kasus 13: Hari terakhir pengobatan (hari ke-180) tetap dipantau -> Merah bila 2 hari tidak check-in
  const kasus13 = tentukanStatusPasien({
    jamMinum,
    sudahCheckInHariIni: false,
    sudahCheckInKemarin: false,
    tanggalMulai: "2026-04-18",
    durasiHari: 180,
    tanggalHariIni,
    waktuSekarang: waktuWIB(tanggalHariIni, "08:30"),
  });
  console.assert(kasus13.status === "merah", `Kasus 13 gagal: diharapkan merah, didapat ${kasus13.status}`);

  // Kasus 8: Urutan prioritas pasien (Merah di paling atas)
  const daftarAcak = [
    { nama: "C", status: "hijau" as const },
    { nama: "A", status: "merah" as const },
    { nama: "B", status: "kuning" as const },
  ];
  const diurutkan = urutkanPrioritasPasien(daftarAcak);
  console.assert(
    diurutkan[0].status === "merah" && diurutkan[1].status === "kuning" && diurutkan[2].status === "hijau",
    "Kasus 8 gagal: pengurutan prioritas tidak sesuai",
  );

  return true;
}
