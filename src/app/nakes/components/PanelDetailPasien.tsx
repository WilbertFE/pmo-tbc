"use client";

import type { ReactNode } from "react";
import { ClipboardPen, FileVideo, MousePointerClick } from "lucide-react";
import { cn } from "@/lib/utils";
import { tanggalWIB } from "@/lib/tanggal";
import {
  jamMinumTampil,
  jamWIBDari,
  LABEL_VERIFIKASI,
  TagStatus,
  tanggalPanjang,
  tanggalPendek,
} from "./status-tampilan";
import type { PasienNakes } from "./types";

interface PanelDetailPasienProps {
  pasien: PasienNakes | null;
  onBukaVerifikasi: (pasien: PasienNakes) => void;
  onBukaTindakLanjut: (pasien: PasienNakes) => void;
}

const gayaTombolPanel =
  "inline-flex h-9 w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-[8px] border border-muted bg-[#fcfcfc] px-3.5 text-sm leading-[22px] font-medium shadow-[inset_0px_-5px_3px_0px_#f4f4f5,inset_0px_0px_0px_3px_white] transition hover:bg-brand-50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#fcfcfc]";

const GAYA_TINGKAT: Record<string, string> = {
  berat: "bg-alert-subtle text-[#b3261e]",
  sedang: "bg-warning-subtle text-[#9a5b00]",
  ringan: "bg-muted text-muted-foreground",
};

function Info({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <p className="text-xs leading-4 text-muted-foreground">{label}</p>
      <div className="text-sm leading-[18px] text-foreground">{children}</div>
    </div>
  );
}

// Panel detail pasien terpilih (kolom kanan desain Figma)
export function PanelDetailPasien({ pasien, onBukaVerifikasi, onBukaTindakLanjut }: PanelDetailPasienProps) {
  if (!pasien) {
    return (
      <aside className="flex flex-col items-center gap-2 rounded-md border border-[#d4d4d8] px-3 py-8 text-center">
        <MousePointerClick aria-hidden className="size-6 text-muted-foreground" />
        <p className="text-sm leading-[18px] text-muted-foreground">Pilih pasien di tabel untuk melihat detail.</p>
      </aside>
    );
  }

  const checkin = pasien.checkinHariIni;

  return (
    <aside aria-label={`Detail ${pasien.nama}`} className="flex flex-col gap-5 rounded-md border border-[#d4d4d8] px-3 py-4">
      <div className="flex flex-col gap-2 px-2">
        <p className="text-base leading-5 font-medium text-foreground">{pasien.nama}</p>
        <p className="text-xs leading-4 text-muted-foreground">Status</p>
        <TagStatus pasien={pasien} />
        {pasien.alasanStatus.length > 0 && (
          <ul className="flex list-disc flex-col gap-0.5 pl-4 text-xs leading-4 text-muted-foreground">
            {pasien.alasanStatus.map((alasan) => (
              <li key={alasan}>{alasan}</li>
            ))}
          </ul>
        )}
        <div className="mt-1 flex flex-col gap-3">
          <Info label="Check-in Hari Ini">
            {checkin ? (
              <>
                {tanggalPendek(tanggalWIB())} ({jamWIBDari(checkin.createdAt)})
                <span
                  className={cn(
                    "mt-1 block w-fit rounded-full px-2 text-xs leading-5",
                    checkin.status === "terverifikasi" && "bg-success-subtle text-[#0b7a5a]",
                    checkin.status === "ditolak" && "bg-alert-subtle text-[#b3261e]",
                    checkin.status === "menunggu" && "bg-info-subtle text-[#1f6fa8]",
                  )}
                >
                  {LABEL_VERIFIKASI[checkin.status]}
                </span>
              </>
            ) : (
              <span className="text-muted-foreground">Belum check-in</span>
            )}
          </Info>
          <Info label="Jadwal Minum Obat">{jamMinumTampil(pasien.jamMinum)}</Info>
        </div>
      </div>

      <div className="h-px bg-border" />

      <div className="flex flex-col gap-3 px-2">
        <div className="grid grid-cols-2 gap-3">
          <Info label="Progres">
            Hari ke-{pasien.progres.hariKe} dari {pasien.durasiHari}
          </Info>
          <Info label="PMO">
            <span className="block truncate">{pasien.namaPmo}</span>
          </Info>
        </div>
        <Info label="Mulai Pengobatan">{tanggalPanjang(pasien.tanggalMulai)}</Info>
        <Info label="Efek Samping (3 hari terakhir)">
          {pasien.riwayatEfekSamping.length > 0 ? (
            <ul className="mt-0.5 flex flex-col gap-1">
              {pasien.riwayatEfekSamping.slice(0, 3).map((efek) => (
                <li key={efek.id} className="flex items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2 text-[11px] leading-5 capitalize",
                      GAYA_TINGKAT[efek.tingkat] ?? GAYA_TINGKAT.ringan,
                    )}
                  >
                    {efek.tingkat}
                  </span>
                  <span className="truncate" title={efek.catatan ?? efek.jenis}>
                    {efek.jenis}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <span className="text-muted-foreground">Tidak ada keluhan</span>
          )}
        </Info>
      </div>

      <div className="h-px bg-border" />

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => onBukaVerifikasi(pasien)}
          disabled={!checkin}
          title={checkin ? undefined : "Pasien belum check-in hari ini"}
          className={cn(gayaTombolPanel, "text-primary")}
        >
          <FileVideo aria-hidden className="size-[18px]" />
          Tinjau Bukti
        </button>
        <button
          type="button"
          onClick={() => onBukaTindakLanjut(pasien)}
          className={cn(gayaTombolPanel, pasien.status === "merah" ? "text-alert" : "text-primary")}
        >
          <ClipboardPen aria-hidden className="size-[18px]" />
          Tindak Lanjut
        </button>
      </div>
    </aside>
  );
}
