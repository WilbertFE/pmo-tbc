"use client";

import type { ReactNode } from "react";
import { ClipboardPen, FileVideo, MousePointerClick } from "lucide-react";
import { cn } from "@/lib/utils";
import { selisihHari, tambahHari, tanggalWIB } from "@/lib/tanggal";
import {
  jamMinumTampil,
  jamWIBDari,
  LABEL_VERIFIKASI,
  TagStatus,
  tanggalPanjang,
  tanggalPendek,
} from "./status-tampilan";
import type { CheckinDitinjau } from "./ModalVerifikasi";
import type { PasienNakes } from "./types";
import type { LevelRisiko } from "@/lib/risiko-putus-obat";

interface PanelDetailPasienProps {
  pasien: PasienNakes | null;
  onBukaVerifikasi: (pasien: PasienNakes, checkin: CheckinDitinjau) => void;
  onBukaTindakLanjut: (pasien: PasienNakes) => void;
}

const gayaTombolPanel =
  "inline-flex h-9 w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-[8px] border border-muted bg-[#fcfcfc] px-3.5 text-sm leading-[22px] font-medium shadow-[inset_0px_-5px_3px_0px_#f4f4f5,inset_0px_0px_0px_3px_white] transition hover:bg-brand-50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#fcfcfc]";

const GAYA_TINGKAT: Record<string, string> = {
  berat: "bg-alert-subtle text-[#b3261e]",
  sedang: "bg-warning-subtle text-[#9a5b00]",
  ringan: "bg-muted text-muted-foreground",
};

const GAYA_VERIFIKASI: Record<string, string> = {
  terverifikasi: "bg-success-subtle text-[#0b7a5a]",
  ditolak: "bg-alert-subtle text-[#b3261e]",
  menunggu: "bg-info-subtle text-[#1f6fa8]",
};

const LABEL_RISIKO: Record<LevelRisiko, string> = { rendah: "Rendah", sedang: "Sedang", tinggi: "Tinggi" };

const GAYA_RISIKO: Record<LevelRisiko, string> = {
  rendah: "bg-success-subtle text-[#0b7a5a]",
  sedang: "bg-warning-subtle text-[#9a5b00]",
  tinggi: "bg-alert-subtle text-[#b3261e]",
};

const WARNA_BAR_RISIKO: Record<LevelRisiko, string> = {
  rendah: "bg-success",
  sedang: "bg-warning",
  tinggi: "bg-alert",
};

const LABEL_RIWAYAT: Record<"menunggu" | "terverifikasi" | "ditolak", string> = {
  menunggu: "Menunggu",
  terverifikasi: "Terverifikasi",
  ditolak: "Ditolak",
};

// Tanggal 7 hari terakhir yang termasuk masa pengobatan, terbaru di atas
function hariRiwayat(pasien: PasienNakes) {
  const hariIni = tanggalWIB();
  return Array.from({ length: 7 }, (_, i) => tambahHari(hariIni, -i)).filter(
    (tgl) => selisihHari(pasien.tanggalMulai, tgl) >= 0,
  );
}

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
                    "mt-1 block w-fit rounded-full px-2 text-xs leading-5 whitespace-nowrap",
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

      <div className="flex flex-col gap-2 px-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs leading-4 text-muted-foreground">Risiko Putus Obat (14 hari)</p>
          {pasien.risiko.dataCukup && (
            <span
              className={cn("rounded-full px-2 text-[11px] leading-5 font-medium", GAYA_RISIKO[pasien.risiko.level])}
            >
              {LABEL_RISIKO[pasien.risiko.level]} · {pasien.risiko.skor}/100
            </span>
          )}
        </div>
        {pasien.risiko.dataCukup ? (
          <>
            <div
              role="meter"
              aria-label="Skor risiko putus obat"
              aria-valuenow={pasien.risiko.skor}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-1.5 overflow-hidden rounded-full bg-muted"
            >
              <div
                className={cn("h-full rounded-full", WARNA_BAR_RISIKO[pasien.risiko.level])}
                style={{ width: `${Math.max(pasien.risiko.skor, 2)}%` }}
              />
            </div>
            {pasien.risiko.faktor.length > 0 ? (
              <ul className="flex list-disc flex-col gap-0.5 pl-4 text-xs leading-4 text-muted-foreground">
                {pasien.risiko.faktor.slice(0, 4).map((f) => (
                  <li key={f.alasan}>{f.alasan}</li>
                ))}
              </ul>
            ) : (
              <p className="text-xs leading-4 text-muted-foreground">Rutin dan tepat waktu, tidak ada tanda risiko.</p>
            )}
          </>
        ) : (
          <p className="text-xs leading-4 text-muted-foreground">Data belum cukup (pengobatan baru dimulai).</p>
        )}
      </div>

      <div className="h-px bg-border" />

      <div className="flex flex-col gap-2 px-2">
        <p className="text-xs leading-4 text-muted-foreground">Riwayat 7 Hari</p>
        <ul className="flex flex-col gap-1.5">
          {hariRiwayat(pasien).map((tgl) => {
            const item = pasien.riwayatCheckin.find((c) => c.tanggal === tgl);
            return (
              <li key={tgl} className="grid grid-cols-[72px_1fr_auto] items-center gap-1.5 text-xs leading-[18px]">
                <span className="shrink-0 text-foreground">{tanggalPendek(tgl)}</span>
                <div className="flex min-w-0 items-center justify-start">
                  {item ? (
                    <span
                      title={LABEL_VERIFIKASI[item.status]}
                      className={cn(
                        "rounded-full px-2 text-[11px] leading-5 font-medium whitespace-nowrap",
                        GAYA_VERIFIKASI[item.status],
                      )}
                    >
                      {LABEL_RIWAYAT[item.status]}
                    </span>
                  ) : (
                    <span className="text-muted-foreground whitespace-nowrap">Tidak check-in</span>
                  )}
                </div>
                <div className="w-12 shrink-0 text-right">
                  {item && (
                    <button
                      type="button"
                      onClick={() => onBukaVerifikasi(pasien, item)}
                      className="rounded-md px-1.5 py-0.5 text-xs font-medium text-primary hover:bg-brand-50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                    >
                      Tinjau
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="h-px bg-border" />

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => checkin && onBukaVerifikasi(pasien, checkin)}
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
