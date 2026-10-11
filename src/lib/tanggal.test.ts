import { describe, expect, it } from "vitest";
import { jamWIB, selisihHari, tambahHari, tanggalWIB, waktuWIB } from "./tanggal";

describe("tanggalWIB dan jamWIB", () => {
  it("00.30 WIB masih tanggal kemarin di UTC, tapi tanggal hari ini di WIB", () => {
    const waktu = new Date("2026-10-13T17:30:00Z");
    expect(tanggalWIB(waktu)).toBe("2026-10-14");
    expect(jamWIB(waktu)).toBe("00:30:00");
  });

  it("23.59 WIB tetap tanggal yang sama", () => {
    expect(tanggalWIB(new Date("2026-10-13T16:59:59Z"))).toBe("2026-10-13");
  });
});

describe("selisihHari", () => {
  it("menghitung hari kalender", () => {
    expect(selisihHari("2026-10-01", "2026-10-03")).toBe(2);
  });

  it("melewati akhir Februari", () => {
    expect(selisihHari("2026-02-27", "2026-03-01")).toBe(2);
  });

  it("negatif bila tanggal tujuan lebih awal", () => {
    expect(selisihHari("2026-10-03", "2026-10-01")).toBe(-2);
  });
});

describe("tambahHari", () => {
  it("melewati akhir bulan", () => {
    expect(tambahHari("2026-10-31", 1)).toBe("2026-11-01");
  });

  it("mundur melewati akhir tahun", () => {
    expect(tambahHari("2026-01-01", -1)).toBe("2025-12-31");
  });
});

describe("waktuWIB", () => {
  it("menerima format HH:mm dan HH:mm:ss", () => {
    expect(waktuWIB("2026-10-14", "07:00").toISOString()).toBe("2026-10-14T00:00:00.000Z");
    expect(waktuWIB("2026-10-14", "07:00:00").toISOString()).toBe("2026-10-14T00:00:00.000Z");
  });
});
