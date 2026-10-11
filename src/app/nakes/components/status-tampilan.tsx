import { cn } from "@/lib/utils";
import type { PasienNakes } from "./types";

type JenisTag = "merah" | "kuning" | "hijau" | "netral";

// Label singkat untuk tag "Status Hari Ini" sesuai desain Figma.
// Warna mengikuti status early warning dari src/lib/status-pasien.ts.
export function tampilanStatus(pasien: PasienNakes): { label: string; jenis: JenisTag } {
  const alasan = pasien.alasanStatus.join(" ").toLowerCase();

  if (pasien.status === "merah") {
    return {
      label: alasan.includes("efek samping berat") ? "Efek Samping Berat" : "Terlewat 2 Hari",
      jenis: "merah",
    };
  }

  if (pasien.status === "kuning") {
    return {
      label: alasan.includes("terlambat") ? "Terlambat Minum Obat" : "Efek Samping Sedang",
      jenis: "kuning",
    };
  }

  if (pasien.checkinHariIni) {
    return { label: "Sudah Minum Obat", jenis: "hijau" };
  }

  // Hijau tanpa check-in: belum lewat jadwal, belum mulai, atau pengobatan selesai
  if (pasien.keteranganStatus === "Belum mulai" || pasien.keteranganStatus === "Pengobatan selesai") {
    return { label: pasien.keteranganStatus, jenis: "netral" };
  }
  return { label: "Belum Jadwal Minum", jenis: "netral" };
}

const GAYA_TAG: Record<JenisTag, string> = {
  merah: "bg-alert text-white",
  kuning: "bg-warning text-white",
  hijau: "bg-success text-white",
  netral: "bg-muted text-muted-foreground",
};

const GAYA_TITIK: Record<JenisTag, string> = {
  merah: "bg-white",
  kuning: "bg-white",
  hijau: "bg-white",
  netral: "bg-muted-foreground",
};

export function TagStatus({ pasien, className }: { pasien: PasienNakes; className?: string }) {
  const { label, jenis } = tampilanStatus(pasien);

  return (
    <span
      className={cn(
        "inline-flex w-full items-center gap-2 rounded-md px-4 py-2 text-xs leading-4 font-medium",
        GAYA_TAG[jenis],
        className,
      )}
    >
      <span aria-hidden className={cn("size-1.5 shrink-0 rounded-full", GAYA_TITIK[jenis])} />
      <span className="truncate">{label}</span>
    </span>
  );
}

const formatTanggalPendek = new Intl.DateTimeFormat("id-ID", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

const formatTanggalPanjang = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const formatJam = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Jakarta",
});

// "2026-10-11" -> "Sab, 11 Okt" (tanggal kalender, tanpa geser zona waktu)
export function tanggalPendek(tanggal: string) {
  return formatTanggalPendek.format(new Date(`${tanggal}T00:00:00Z`));
}

// "2026-10-11" -> "11 Oktober 2026"
export function tanggalPanjang(tanggal: string) {
  return formatTanggalPanjang.format(new Date(`${tanggal}T00:00:00Z`));
}

// Waktu ISO -> "09.15 WIB"
export function jamWIBDari(waktuISO: string) {
  return `${formatJam.format(new Date(waktuISO))} WIB`;
}

// "07:00:00" -> "07.00 WIB"
export function jamMinumTampil(jam: string) {
  return `${jam.slice(0, 5).replace(":", ".")} WIB`;
}

export const LABEL_VERIFIKASI: Record<"menunggu" | "terverifikasi" | "ditolak", string> = {
  menunggu: "Menunggu verifikasi",
  terverifikasi: "Terverifikasi",
  ditolak: "Bukti ditolak",
};
