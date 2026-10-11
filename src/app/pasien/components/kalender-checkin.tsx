"use client";

import { cn } from "@/lib/utils";
import type { StatusCheckin } from "@/lib/supabase/database.types";
import { tambahHari } from "@/lib/tanggal";

type HariKalender = {
  tanggal: string; // "YYYY-MM-DD"
  status: "checkin-terverifikasi" | "checkin-menunggu" | "checkin-ditolak" | "terlewat" | "belum-tiba" | "hari-ini";
};

type CheckinItem = { tanggal: string; status: StatusCheckin };

type KalenderCheckinProps = {
  checkins: CheckinItem[];
  tanggalMulai: string;
  durasiHari: number;
  tanggalHariIni: string;
  bulan: number; // 0-11
  tahun: number;
};

const NAMA_HARI = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const NAMA_BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function warnaDot(status: HariKalender["status"]) {
  switch (status) {
    case "checkin-terverifikasi":
      return "bg-emerald-500";
    case "checkin-menunggu":
      return "bg-amber-400";
    case "checkin-ditolak":
      return "bg-red-400";
    case "terlewat":
      return "bg-red-500/60";
    case "hari-ini":
      return "bg-sky-500 ring-2 ring-sky-500/30";
    case "belum-tiba":
    default:
      return "bg-muted";
  }
}

function labelStatus(status: HariKalender["status"]) {
  switch (status) {
    case "checkin-terverifikasi":
      return "Terverifikasi";
    case "checkin-menunggu":
      return "Menunggu verifikasi";
    case "checkin-ditolak":
      return "Ditolak";
    case "terlewat":
      return "Terlewat";
    case "hari-ini":
      return "Hari ini";
    case "belum-tiba":
      return "Belum tiba";
  }
}

export default function KalenderCheckin({
  checkins,
  tanggalMulai,
  durasiHari,
  tanggalHariIni,
  bulan,
  tahun,
}: KalenderCheckinProps) {
  const hariList = bangunKalender(
    checkins,
    tanggalMulai,
    durasiHari,
    tanggalHariIni
  );

  // Bikin map tanggal -> status untuk lookup cepat

  const statusMap = new Map(hariList.map((h) => [h.tanggal, h]));

  // Tanggal 1 bulan ini, hari apa (0=Min, 1=Sen, ..., 6=Sab)
  const tanggalSatu = new Date(tahun, bulan, 1);
  const hariPertama = tanggalSatu.getDay();
  // Konversi ke format Sen=0 (ISO): (hariPertama + 6) % 7
  const offsetAwal = (hariPertama + 6) % 7;

  // Jumlah hari di bulan ini
  const jumlahHari = new Date(tahun, bulan + 1, 0).getDate();

  // Bikin array sel kalender
  const selKalender: (HariKalender | null)[] = [];
  for (let i = 0; i < offsetAwal; i++) {
    selKalender.push(null); // sel kosong sebelum tanggal 1
  }
  for (let d = 1; d <= jumlahHari; d++) {
    const tgl = `${tahun}-${String(bulan + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const data = statusMap.get(tgl);
    selKalender.push(data ?? { tanggal: tgl, status: "belum-tiba" });
  }

  return (
    <div>
      <h3 className="text-sm font-semibold mb-3 text-center">
        {NAMA_BULAN[bulan]} {tahun}
      </h3>

      {/* Header hari */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {NAMA_HARI.map((h) => (
          <div key={h} className="text-center text-xs text-muted-foreground font-medium">
            {h}
          </div>
        ))}
      </div>

      {/* Grid tanggal */}
      <div className="grid grid-cols-7 gap-1">
        {selKalender.map((sel, i) => {
          if (!sel) {
            return <div key={`empty-${i}`} className="aspect-square" />;
          }
          const hari = parseInt(sel.tanggal.split("-")[2], 10);
          return (
            <div
              key={sel.tanggal}
              className="aspect-square flex flex-col items-center justify-center gap-0.5 rounded-md hover:bg-accent/50 transition-colors"
              title={`${hari} - ${labelStatus(sel.status)}`}
            >
              <span className="text-xs text-muted-foreground leading-none">
                {hari}
              </span>
              <div className={cn("w-2.5 h-2.5 rounded-full", warnaDot(sel.status))} />
            </div>
          );
        })}
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-3 mt-4 justify-center">
        {(
          [
            ["checkin-terverifikasi", "Terverifikasi"],
            ["checkin-menunggu", "Menunggu"],
            ["terlewat", "Terlewat"],
            ["hari-ini", "Hari ini"],
          ] as const
        ).map(([status, label]) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className={cn("w-2.5 h-2.5 rounded-full", warnaDot(status))} />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper: bangun array HariKalender dari data check-in dan info pengobatan
export function bangunKalender(
  checkins: { tanggal: string; status: StatusCheckin }[],
  tanggalMulai: string,
  durasiHari: number,
  tanggalHariIni: string,
): HariKalender[] {
  const checkinMap = new Map(checkins.map((c) => [c.tanggal, c.status]));
  const tanggalAkhirStr = tambahHari(tanggalMulai, durasiHari - 1);

  const hasil: HariKalender[] = [];
  const batasStr = tanggalHariIni < tanggalAkhirStr ? tanggalHariIni : tanggalAkhirStr;

  let cursor = tanggalMulai;
  while (cursor <= batasStr) {
    const statusCheckin = checkinMap.get(cursor);

    let status: HariKalender["status"];
    if (cursor === tanggalHariIni) {
      if (statusCheckin) {
        // Sudah check-in hari ini
        status =
          statusCheckin === "terverifikasi"
            ? "checkin-terverifikasi"
            : statusCheckin === "ditolak"
              ? "checkin-ditolak"
              : "checkin-menunggu";
      } else {
        status = "hari-ini";
      }
    } else if (statusCheckin) {
      status =
        statusCheckin === "terverifikasi"
          ? "checkin-terverifikasi"
          : statusCheckin === "ditolak"
            ? "checkin-ditolak"
            : "checkin-menunggu";
    } else {
      status = "terlewat";
    }

    hasil.push({ tanggal: cursor, status });
    cursor = tambahHari(cursor, 1);
  }

  // Tambahkan hari yang belum tiba (setelah hari ini sampai akhir pengobatan)
  if (tanggalHariIni < tanggalAkhirStr) {
    let sisaCursor = tambahHari(tanggalHariIni, 1);
    while (sisaCursor <= tanggalAkhirStr) {
      hasil.push({ tanggal: sisaCursor, status: "belum-tiba" });
      sisaCursor = tambahHari(sisaCursor, 1);
    }
  }

  return hasil;
}

