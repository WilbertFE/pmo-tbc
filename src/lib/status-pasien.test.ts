import { describe, expect, it } from "vitest";
import { tentukanStatusPasien, urutkanPrioritasPasien } from "./status-pasien";
import { waktuWIB } from "./tanggal";

// Logika early warning sesuai AGENTS.md bagian 7
const tanggalHariIni = "2026-10-14";
const jamMinum = "08:00";
const jam = (hhmm: string) => waktuWIB(tanggalHariIni, hhmm);

describe("tentukanStatusPasien", () => {
  it("hijau: sudah check-in hari ini tanpa efek samping", () => {
    const hasil = tentukanStatusPasien({
      jamMinum,
      sudahCheckInHariIni: true,
      sudahCheckInKemarin: true,
      tanggalHariIni,
      waktuSekarang: jam("10:00"),
    });
    expect(hasil.status).toBe("hijau");
  });

  it("hijau: belum check-in tetapi belum lewat jam minum", () => {
    const hasil = tentukanStatusPasien({
      jamMinum,
      sudahCheckInHariIni: false,
      sudahCheckInKemarin: true,
      tanggalHariIni,
      waktuSekarang: jam("07:00"),
    });
    expect(hasil.status).toBe("hijau");
  });

  it("kuning: belum check-in dan lewat lebih dari 2 jam dari jam minum", () => {
    const hasil = tentukanStatusPasien({
      jamMinum,
      sudahCheckInHariIni: false,
      sudahCheckInKemarin: true,
      tanggalHariIni,
      waktuSekarang: jam("10:30"),
    });
    expect(hasil.status).toBe("kuning");
  });

  it("kuning: efek samping sedang dalam 3 hari terakhir walau sudah check-in", () => {
    const hasil = tentukanStatusPasien({
      jamMinum,
      sudahCheckInHariIni: true,
      sudahCheckInKemarin: true,
      daftarEfekSampingTerakhir: [{ tingkat: "sedang", tanggal: "2026-10-13" }],
      tanggalHariIni,
      waktuSekarang: jam("09:00"),
    });
    expect(hasil.status).toBe("kuning");
  });

  it("efek samping lebih dari 3 hari lalu tidak dihitung", () => {
    const hasil = tentukanStatusPasien({
      jamMinum,
      sudahCheckInHariIni: true,
      sudahCheckInKemarin: true,
      daftarEfekSampingTerakhir: [{ tingkat: "berat", tanggal: "2026-10-11" }],
      tanggalHariIni,
      waktuSekarang: jam("09:00"),
    });
    expect(hasil.status).toBe("hijau");
  });

  it("merah: tidak check-in kemarin dan hari ini sudah lewat jam minum", () => {
    const hasil = tentukanStatusPasien({
      jamMinum,
      sudahCheckInHariIni: false,
      sudahCheckInKemarin: false,
      tanggalHariIni,
      waktuSekarang: jam("08:30"),
    });
    expect(hasil.status).toBe("merah");
  });

  it("merah: efek samping berat dalam 3 hari terakhir", () => {
    const hasil = tentukanStatusPasien({
      jamMinum,
      sudahCheckInHariIni: true,
      sudahCheckInKemarin: true,
      daftarEfekSampingTerakhir: [{ tingkat: "berat", tanggal: "2026-10-14" }],
      tanggalHariIni,
      waktuSekarang: jam("09:00"),
    });
    expect(hasil.status).toBe("merah");
  });

  it("merah menang bila merah dan kuning sama-sama terpenuhi", () => {
    const hasil = tentukanStatusPasien({
      jamMinum,
      sudahCheckInHariIni: false,
      sudahCheckInKemarin: false,
      daftarEfekSampingTerakhir: [{ tingkat: "sedang", tanggal: "2026-10-14" }],
      tanggalHariIni,
      waktuSekarang: jam("11:00"),
    });
    expect(hasil.status).toBe("merah");
  });

  describe("masa pengobatan", () => {
    it("hari pertama: kemarin tidak dihitung, jadi kuning bukan merah", () => {
      const hasil = tentukanStatusPasien({
        jamMinum,
        sudahCheckInHariIni: false,
        sudahCheckInKemarin: false,
        tanggalMulai: tanggalHariIni,
        durasiHari: 180,
        tanggalHariIni,
        waktuSekarang: jam("15:00"),
      });
      expect(hasil.status).toBe("kuning");
    });

    it("hari kedua: kemarin dihitung, jadi merah", () => {
      const hasil = tentukanStatusPasien({
        jamMinum,
        sudahCheckInHariIni: false,
        sudahCheckInKemarin: false,
        tanggalMulai: "2026-10-13",
        durasiHari: 180,
        tanggalHariIni,
        waktuSekarang: jam("08:30"),
      });
      expect(hasil.status).toBe("merah");
    });

    it("belum dimulai: hijau", () => {
      const hasil = tentukanStatusPasien({
        jamMinum,
        sudahCheckInHariIni: false,
        sudahCheckInKemarin: false,
        tanggalMulai: "2026-10-20",
        durasiHari: 180,
        tanggalHariIni,
        waktuSekarang: jam("15:00"),
      });
      expect(hasil.status).toBe("hijau");
      expect(hasil.keterangan).toBe("Belum mulai");
    });

    it("sudah selesai (hari ke-181 dari 180): hijau", () => {
      const hasil = tentukanStatusPasien({
        jamMinum,
        sudahCheckInHariIni: false,
        sudahCheckInKemarin: false,
        tanggalMulai: "2026-04-17",
        durasiHari: 180,
        tanggalHariIni,
        waktuSekarang: jam("15:00"),
      });
      expect(hasil.status).toBe("hijau");
      expect(hasil.keterangan).toBe("Pengobatan selesai");
    });

    it("hari terakhir (hari ke-180) tetap dipantau", () => {
      const hasil = tentukanStatusPasien({
        jamMinum,
        sudahCheckInHariIni: false,
        sudahCheckInKemarin: false,
        tanggalMulai: "2026-04-18",
        durasiHari: 180,
        tanggalHariIni,
        waktuSekarang: jam("08:30"),
      });
      expect(hasil.status).toBe("merah");
    });
  });
});

describe("urutkanPrioritasPasien", () => {
  it("merah di atas, lalu kuning, lalu hijau", () => {
    const hasil = urutkanPrioritasPasien([
      { nama: "C", status: "hijau" as const },
      { nama: "A", status: "merah" as const },
      { nama: "B", status: "kuning" as const },
    ]);
    expect(hasil.map((p) => p.status)).toEqual(["merah", "kuning", "hijau"]);
  });
});
