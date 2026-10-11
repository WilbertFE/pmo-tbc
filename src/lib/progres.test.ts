import { describe, expect, it } from "vitest";
import { hitungProgres } from "./progres";

describe("hitungProgres", () => {
  it("hari pertama adalah hari ke-1", () => {
    expect(hitungProgres("2026-10-14", 180, "2026-10-14")).toEqual({
      hariKe: 1,
      durasiHari: 180,
      persen: 1,
      belumMulai: false,
      selesai: false,
    });
  });

  it("contoh di AGENTS.md: hari ke-47 dari 180", () => {
    expect(hitungProgres("2026-08-29", 180, "2026-10-14").hariKe).toBe(47);
  });

  it("belum mulai: hari ke-0", () => {
    expect(hitungProgres("2026-10-20", 180, "2026-10-14")).toMatchObject({ hariKe: 0, persen: 0, belumMulai: true });
  });

  it("dibatasi maksimal durasi_hari", () => {
    expect(hitungProgres("2026-01-01", 180, "2026-12-01")).toMatchObject({ hariKe: 180, persen: 100, selesai: true });
  });
});
