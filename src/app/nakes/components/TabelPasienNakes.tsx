"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  FileVideo,
  ClipboardPen,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Activity,
} from "lucide-react";
import type { PasienNakes } from "./types";

interface TabelPasienNakesProps {
  daftarPasien: PasienNakes[];
  onBukaVerifikasi: (pasien: PasienNakes) => void;
  onBukaTindakLanjut: (pasien: PasienNakes) => void;
}

export function TabelPasienNakes({
  daftarPasien,
  onBukaVerifikasi,
  onBukaTindakLanjut,
}: TabelPasienNakesProps) {
  if (daftarPasien.length === 0) {
    return (
      <div className="p-12 text-center border rounded-2xl bg-muted/20">
        <Activity className="size-10 mx-auto text-muted-foreground/60 mb-2" />
        <h4 className="font-semibold text-base">Tidak ada pasien ditemukan</h4>
        <p className="text-xs text-muted-foreground mt-1">
          Tidak ada data pasien yang sesuai dengan kata kunci atau filter saat ini.
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-2xl overflow-hidden bg-background shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b bg-muted/50 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <th className="py-3 px-4 w-4">Prioritas</th>
              <th className="py-3 px-4">Nama Pasien & PMO</th>
              <th className="py-3 px-4">Status & Alasan</th>
              <th className="py-3 px-4">Jadwal Minum</th>
              <th className="py-3 px-4">Progres Pengobatan</th>
              <th className="py-3 px-4">Bukti Check-in Hari Ini</th>
              <th className="py-3 px-4">Keluhan Efek Samping</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {daftarPasien.map((pasien) => {
              const checkin = pasien.checkinHariIni;

              // Warna bar status kiri
              const warnaBorderKiri =
                pasien.status === "merah"
                  ? "border-l-4 border-l-red-600 bg-red-500/[0.02]"
                  : pasien.status === "kuning"
                  ? "border-l-4 border-l-amber-500 bg-amber-500/[0.02]"
                  : "border-l-4 border-l-emerald-600";

              return (
                <tr
                  key={pasien.id}
                  className={`hover:bg-muted/40 transition-colors ${warnaBorderKiri}`}
                >
                  {/* Indikator Status */}
                  <td className="py-3.5 px-4 text-center">
                    {pasien.status === "merah" && (
                      <span
                        title="Prioritas Segera"
                        className="inline-flex p-1.5 rounded-full bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400"
                      >
                        <AlertCircle className="size-4" />
                      </span>
                    )}
                    {pasien.status === "kuning" && (
                      <span
                        title="Perlu Pemantauan"
                        className="inline-flex p-1.5 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"
                      >
                        <AlertTriangle className="size-4" />
                      </span>
                    )}
                    {pasien.status === "hijau" && (
                      <span
                        title="Terkendali"
                        className="inline-flex p-1.5 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                      >
                        <CheckCircle2 className="size-4" />
                      </span>
                    )}
                  </td>

                  {/* Info Pasien & PMO */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-foreground text-sm">
                      {pasien.nama}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <span>PMO:</span>
                      <span className="font-medium text-foreground/80">
                        {pasien.namaPmo}
                      </span>
                    </div>
                  </td>

                  {/* Status & Keterangan Early Warning */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                        pasien.status === "merah"
                          ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300"
                          : pasien.status === "kuning"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                      }`}
                    >
                      {pasien.keteranganStatus}
                    </span>
                    {pasien.alasanStatus.length > 0 && (
                      <ul className="text-[11px] text-muted-foreground list-disc list-inside mt-1 space-y-0.5">
                        {pasien.alasanStatus.map((alasan, idx) => (
                          <li key={idx} className="leading-tight">
                            {alasan}
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>

                  {/* Jam Minum Obat */}
                  <td className="py-3.5 px-4 text-xs font-medium">
                    <div className="flex items-center gap-1 text-foreground">
                      <Clock className="size-3.5 text-muted-foreground" />
                      {pasien.jamMinum.slice(0, 5)} WIB
                    </div>
                  </td>

                  {/* Progres Pengobatan */}
                  <td className="py-3.5 px-4">
                    <div className="text-xs font-semibold text-foreground">
                      Hari ke-{pasien.progres.hariKe} dari {pasien.durasiHari}
                    </div>
                    <div className="w-28 bg-muted rounded-full h-1.5 mt-1.5 overflow-hidden">
                      <div
                        className="bg-primary h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${pasien.progres.persen}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {pasien.progres.persen}% selesai
                    </span>
                  </td>

                  {/* Bukti Check-in Hari Ini */}
                  <td className="py-3.5 px-4">
                    {checkin ? (
                      <div className="space-y-1">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                            checkin.status === "terverifikasi"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                              : checkin.status === "ditolak"
                              ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                          }`}
                        >
                          {checkin.status === "menunggu"
                            ? "Menunggu Verifikasi"
                            : checkin.status === "terverifikasi"
                            ? "Terverifikasi Valid"
                            : "Bukti Ditolak"}
                        </span>
                        <div className="text-[10px] text-muted-foreground">
                          {new Date(checkin.createdAt).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          WIB
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">
                        Belum check-in
                      </span>
                    )}
                  </td>

                  {/* Riwayat Keluhan Efek Samping */}
                  <td className="py-3.5 px-4 max-w-xs">
                    {pasien.riwayatEfekSamping && pasien.riwayatEfekSamping.length > 0 ? (
                      <div className="space-y-1">
                        {pasien.riwayatEfekSamping.slice(0, 2).map((efek) => (
                          <div
                            key={efek.id}
                            className="text-[11px] leading-tight flex items-start gap-1"
                          >
                            <span
                              className={`px-1.5 py-0.2 rounded font-semibold text-[9px] uppercase shrink-0 ${
                                efek.tingkat === "berat"
                                  ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"
                                  : efek.tingkat === "sedang"
                                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {efek.tingkat}
                            </span>
                            <span className="truncate" title={efek.catatan || efek.jenis}>
                              {efek.jenis}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </td>

                  {/* Tombol Aksi */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {checkin ? (
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => onBukaVerifikasi(pasien)}
                          className="flex items-center gap-1 text-xs"
                        >
                          <FileVideo className="size-3.5 text-primary" />
                          Tinjau Bukti
                        </Button>
                      ) : null}

                      <Button
                        variant={pasien.status === "merah" ? "destructive" : "secondary"}
                        size="xs"
                        onClick={() => onBukaTindakLanjut(pasien)}
                        className="flex items-center gap-1 text-xs"
                      >
                        <ClipboardPen className="size-3.5" />
                        Tindak Lanjut
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
