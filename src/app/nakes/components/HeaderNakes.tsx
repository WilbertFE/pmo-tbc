"use client";

import { HeartPulse, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { tanggalWIB } from "@/lib/tanggal";
import { tanggalPanjang } from "./status-tampilan";
import type { RingkasanDashboard } from "./types";

interface HeaderNakesProps {
  ringkasan: RingkasanDashboard;
  filterAktif: string;
  onPilihFilter: (filter: string) => void;
}

const KARTU = [
  { id: "semua", label: "Total Pasien", kunci: "total", titik: "bg-muted-foreground", keterangan: "Dalam pendampingan" },
  { id: "merah", label: "Perhatian Segera", kunci: "merah", titik: "bg-alert", keterangan: "Prioritas tertinggi" },
  { id: "kuning", label: "Perlu Pemantauan", kunci: "kuning", titik: "bg-warning", keterangan: "Terlambat atau ada keluhan" },
  { id: "hijau", label: "Terkendali", kunci: "hijau", titik: "bg-success", keterangan: "Sesuai jadwal" },
] as const;

// Bar atas khusus layar kecil (sidebar hanya tampil di desktop)
export function BarAtasNakes() {
  return (
    <div className="flex items-center justify-between gap-3 rounded-sm bg-white/90 p-2.5 shadow-[0px_2px_6px_0px_rgba(0,0,0,0.06)] lg:hidden">
      <div className="flex items-center gap-2.5">
        <span className="flex size-10 items-center justify-center rounded-sm bg-brand-500 text-white">
          <HeartPulse aria-hidden className="size-5" />
        </span>
        <p className="text-sm leading-[18px] text-foreground">Portal Nakes</p>
      </div>
      <form action="/api/auth/logout" method="post">
        <button
          type="submit"
          className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-sm text-muted-foreground transition hover:bg-alert-subtle hover:text-alert"
        >
          <LogOut aria-hidden className="size-4" />
          Keluar
        </button>
      </form>
    </div>
  );
}

// Judul halaman dan ringkasan status. Kartu ringkasan juga berfungsi sebagai filter.
export function HeaderNakes({ ringkasan, filterAktif, onPilihFilter }: HeaderNakesProps) {
  return (
    <header className="flex flex-col gap-5">
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h1 className="text-2xl leading-8 font-medium text-foreground">Pemantauan Pasien</h1>
          <p className="text-sm leading-[18px] text-muted-foreground">{tanggalPanjang(tanggalWIB())}</p>
        </div>
        <div className="h-px bg-border" />
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {KARTU.map((kartu) => {
          const aktif = filterAktif === kartu.id;
          return (
            <button
              key={kartu.id}
              type="button"
              onClick={() => onPilihFilter(kartu.id)}
              aria-pressed={aktif}
              className={cn(
                "flex flex-col items-start gap-1 rounded-md border border-[#d4d4d8] bg-white px-4 py-3 text-left transition hover:border-brand-300 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                aktif && "border-brand-500 bg-brand-50",
              )}
            >
              <span className="flex items-center gap-2 text-xs leading-4 text-muted-foreground">
                <span aria-hidden className={cn("size-1.5 rounded-full", kartu.titik)} />
                {kartu.label}
              </span>
              <span className="text-2xl leading-8 font-medium text-foreground">{ringkasan[kartu.kunci]}</span>
              <span className="text-xs leading-4 text-muted-foreground">{kartu.keterangan}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
