import { describe, expect, it } from "vitest";
import { hitungRisikoPutusObat, levelDariSkor, type InputRisiko } from "./risiko-putus-obat";
import { tambahHari } from "./tanggal";

const HARI_INI = "2026-10-14";

// Check-in tepat waktu (07:10 WIB) untuk tanggal-tanggal tertentu
function checkinTepat(tanggal: string[]): InputRisiko["checkin"] {
  return tanggal.map((t) => ({ tanggal: t, status: "terverifikasi" as const, createdAt: `${t}T07:10:00+07:00` }));
}

function hariSebelum(jumlah: number): string[] {
  return Array.from({ length: jumlah }, (_, i) => tambahHari(HARI_INI, -(i + 1)));
}

function input(ubah: Partial<InputRisiko> = {}): InputRisiko {
  return {
    tanggalHariIni: HARI_INI,
    tanggalMulai: "2026-09-01", // hari ke-44, di luar fase rawan
    durasiHari: 180,
    jamMinum: "07:00",
    checkin: checkinTepat(hariSebelum(14)),
    efekSamping: [],
    ...ubah,
  };
}

describe("hitungRisikoPutusObat", () => {
  it("pasien yang selalu check-in tepat waktu berisiko rendah dengan skor 0", () => {
    const hasil = hitungRisikoPutusObat(input());
    expect(hasil.skor).toBe(0);
    expect(hasil.level).toBe("rendah");
    expect(hasil.faktor).toEqual([]);
    expect(hasil.dataCukup).toBe(true);
  });

  it("tidak check-in sama sekali 14 hari berisiko tinggi", () => {
    const hasil = hitungRisikoPutusObat(input({ checkin: [] }));
    // 40 (semua bolong) + 20 (14 hari beruntun)
    expect(hasil.skor).toBe(60);
    expect(hasil.level).toBe("tinggi");
    expect(hasil.faktor[0].alasan).toContain("14 dari 14");
  });

  it("2 hari bolong terakhir memberi poin beruntun 10", () => {
    const hasil = hitungRisikoPutusObat(input({ checkin: checkinTepat(hariSebelum(14).slice(2)) }));
    // round(2/14*40) = 6, ditambah 10
    expect(hasil.skor).toBe(16);
    expect(hasil.faktor.some((f) => f.alasan === "2 hari berturut-turut tidak check-in")).toBe(true);
  });

  it("bukti yang ditolak dihitung bolong dan menambah poin", () => {
    const kemarin = tambahHari(HARI_INI, -1);
    const checkin = checkinTepat(hariSebelum(14).slice(1));
    checkin.push({ tanggal: kemarin, status: "ditolak", createdAt: `${kemarin}T07:10:00+07:00` });
    const hasil = hitungRisikoPutusObat(input({ checkin }));
    // round(1/14*40) = 3, ditolak 5
    expect(hasil.skor).toBe(8);
    expect(hasil.faktor.map((f) => f.alasan)).toContain("1 bukti check-in ditolak");
  });

  it("check-in yang terlambat lebih dari 2 jam menambah poin", () => {
    const checkin = hariSebelum(14).map((t) => ({
      tanggal: t,
      status: "terverifikasi" as const,
      createdAt: `${t}T10:30:00+07:00`, // 3,5 jam setelah jadwal
    }));
    const hasil = hitungRisikoPutusObat(input({ checkin }));
    expect(hasil.skor).toBe(10);
  });

  it("efek samping berat dan sedang dibatasi 20 poin", () => {
    const hasil = hitungRisikoPutusObat(
      input({
        efekSamping: [
          { tingkat: "berat", tanggal: tambahHari(HARI_INI, -2) },
          { tingkat: "sedang", tanggal: tambahHari(HARI_INI, -5) },
          { tingkat: "ringan", tanggal: tambahHari(HARI_INI, -1) },
        ],
      }),
    );
    expect(hasil.skor).toBe(20);
    expect(hasil.faktor[0].alasan).toBe("Efek samping 1 berat, 1 sedang dalam 2 minggu terakhir");
  });

  it("efek samping lebih dari 14 hari lalu diabaikan", () => {
    const hasil = hitungRisikoPutusObat(input({ efekSamping: [{ tingkat: "berat", tanggal: "2026-09-20" }] }));
    expect(hasil.skor).toBe(0);
  });

  it("fase lanjutan (hari ke-50 sampai 120) menambah 5 poin", () => {
    const hasil = hitungRisikoPutusObat(input({ tanggalMulai: "2026-08-01" })); // hari ke-75
    expect(hasil.skor).toBe(5);
  });

  it("pasien yang baru mulai 2 hari belum punya cukup data", () => {
    const hasil = hitungRisikoPutusObat(input({ tanggalMulai: "2026-10-12", checkin: [] }));
    expect(hasil.dataCukup).toBe(false);
    expect(hasil.skor).toBe(0);
  });

  it("hari sebelum tanggal mulai tidak dihitung bolong", () => {
    // Mulai 5 hari lalu, check-in semua 5 hari itu
    const hasil = hitungRisikoPutusObat(input({ tanggalMulai: tambahHari(HARI_INI, -5), checkin: checkinTepat(hariSebelum(5)) }));
    expect(hasil.skor).toBe(0);
    expect(hasil.dataCukup).toBe(true);
  });

  it("pengobatan yang sudah selesai tidak dinilai", () => {
    const hasil = hitungRisikoPutusObat(input({ tanggalMulai: "2026-01-01", checkin: [] }));
    expect(hasil.skor).toBe(0);
    expect(hasil.dataCukup).toBe(false);
  });
});

describe("levelDariSkor", () => {
  it("memetakan batas level", () => {
    expect(levelDariSkor(29)).toBe("rendah");
    expect(levelDariSkor(30)).toBe("sedang");
    expect(levelDariSkor(59)).toBe("sedang");
    expect(levelDariSkor(60)).toBe("tinggi");
  });
});
