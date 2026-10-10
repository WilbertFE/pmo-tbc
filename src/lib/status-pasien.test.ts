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
