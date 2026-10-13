import type { StatusPeringatan } from "@/lib/status-pasien";
import type { Progres } from "@/lib/progres";
import type { HasilRisiko } from "@/lib/risiko-putus-obat";

export type StatusCheckin = "menunggu" | "terverifikasi" | "ditolak";

export interface CheckinHariIni {
  id: string;
  tanggal: string;
  status: StatusCheckin;
  mediaPath: string | null;
  signedMediaUrl: string | null;
  createdAt: string;
}

// Check-in 7 hari terakhir. Signed URL media diambil saat ditinjau lewat /api/nakes/media.
export interface RiwayatCheckin {
  id: string;
  tanggal: string;
  status: StatusCheckin;
  mediaPath: string | null;
  createdAt: string;
}

export interface ItemEfekSamping {
  id: string;
  jenis: string;
  tingkat: "ringan" | "sedang" | "berat";
  catatan: string | null;
  created_at: string;
}

export interface ItemTindakLanjut {
  id: string;
  catatan: string;
  created_at: string;
}

export interface PasienNakes {
  id: string;
  nama: string;
  namaPmo: string;
  jamMinum: string;
  tanggalMulai: string;
  durasiHari: number;
  progres: Progres;
  status: StatusPeringatan;
  alasanStatus: string[];
  keteranganStatus: string;
  checkinHariIni: CheckinHariIni | null;
  risiko: HasilRisiko;
  riwayatCheckin: RiwayatCheckin[];
  riwayatEfekSamping: ItemEfekSamping[];
  riwayatTindakLanjut: ItemTindakLanjut[];
}

export interface RingkasanDashboard {
  total: number;
  merah: number;
  kuning: number;
  hijau: number;
}
