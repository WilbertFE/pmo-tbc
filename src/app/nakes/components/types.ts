import type { StatusPeringatan } from "@/lib/status-pasien";
import type { Progres } from "@/lib/progres";

export interface CheckinHariIni {
  id: string;
  status: "menunggu" | "terverifikasi" | "ditolak";
  mediaPath: string | null;
  signedMediaUrl: string | null;
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
  riwayatEfekSamping: ItemEfekSamping[];
  riwayatTindakLanjut: ItemTindakLanjut[];
}

export interface RingkasanDashboard {
  total: number;
  merah: number;
  kuning: number;
  hijau: number;
}
