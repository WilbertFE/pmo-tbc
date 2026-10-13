import { describe, expect, it } from "vitest";
import { tipeMedia } from "./cek-bukti-ai";

describe("tipeMedia", () => {
  it("memakai tipe dari Storage dan membuang parameter codecs", () => {
    expect(tipeMedia("a/2026-10-12.webm", "video/webm;codecs=vp8,opus")).toBe("video/webm");
  });

  it("menebak dari ekstensi kalau Storage tidak memberi tipe yang berguna", () => {
    expect(tipeMedia("a/2026-10-12.mov", "application/octet-stream")).toBe("video/quicktime");
    expect(tipeMedia("a/2026-10-12.JPG")).toBe("image/jpeg");
  });

  it("menolak format yang tidak dikenal", () => {
    expect(tipeMedia("a/2026-10-12.heic")).toBeNull();
  });
});
