"use client";

import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { jamWIBDari, TagStatus } from "./status-tampilan";
import type { PasienNakes } from "./types";

interface TabelPasienNakesProps {
  daftarPasien: PasienNakes[];
  pasienTerpilihId: string | null;
  onPilihPasien: (pasien: PasienNakes) => void;
  halaman: number;
  barisPerHalaman: number;
  onGantiHalaman: (halaman: number) => void;
  onGantiBarisPerHalaman: (jumlah: number) => void;
}

const PILIHAN_BARIS = [5, 10, 20];

const gayaSel = "h-12 border-b border-[#d4d4d8] px-3 align-middle 2xl:px-4";

// Tabel pasien sesuai desain Figma. Klik baris untuk melihat detail di panel kanan.
export function TabelPasienNakes({
  daftarPasien,
  pasienTerpilihId,
  onPilihPasien,
  halaman,
  barisPerHalaman,
  onGantiHalaman,
  onGantiBarisPerHalaman,
}: TabelPasienNakesProps) {
  const total = daftarPasien.length;
  const jumlahHalaman = Math.max(1, Math.ceil(total / barisPerHalaman));
  const halamanAman = Math.min(halaman, jumlahHalaman);
  const awal = (halamanAman - 1) * barisPerHalaman;
  const barisTampil = daftarPasien.slice(awal, awal + barisPerHalaman);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-md border border-[#d4d4d8] bg-white px-6 py-12 text-center">
        <Users aria-hidden className="size-8 text-muted-foreground" />
        <p className="text-base leading-5 font-medium text-foreground">Tidak ada pasien ditemukan</p>
        <p className="text-sm leading-[18px] text-muted-foreground">
          Coba ubah kata kunci pencarian atau filter status.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md bg-white shadow-[0px_6px_18px_0px_rgba(16,156,241,0.06)]">
      <div className="overflow-x-auto rounded-md border border-[#d4d4d8]">
        <table className="w-full min-w-[560px] border-collapse text-left">
          <thead>
            <tr className="bg-muted text-base leading-5 whitespace-nowrap text-muted-foreground">
              <th scope="col" className={cn(gayaSel, "w-12 px-0 text-center font-normal")}>
                <span className="sr-only">Pilih</span>
              </th>
              <th scope="col" className={cn(gayaSel, "border-l font-normal")}>Nama Pasien</th>
              <th scope="col" className={cn(gayaSel, "border-l font-normal")}>Progres</th>
              <th scope="col" className={cn(gayaSel, "border-l font-normal")}>Waktu Check-in</th>
              <th scope="col" className={cn(gayaSel, "w-[180px] border-l font-normal 2xl:w-[215px]")}>Status Hari Ini</th>
            </tr>
          </thead>
          <tbody className="text-base leading-5 text-black/[0.87]">
            {barisTampil.map((pasien) => {
              const terpilih = pasien.id === pasienTerpilihId;
              return (
                <tr
                  key={pasien.id}
                  onClick={() => onPilihPasien(pasien)}
                  className={cn("cursor-pointer transition-colors", terpilih ? "bg-brand-50" : "hover:bg-muted/50")}
                >
                  <td className={cn(gayaSel, "px-0 text-center")}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPilihPasien(pasien);
                      }}
                      aria-pressed={terpilih}
                      aria-label={`Lihat detail ${pasien.nama}`}
                      className={cn(
                        "inline-block h-[18px] w-[19px] rounded-sm align-middle transition focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                        terpilih ? "bg-brand-500" : "bg-[#e4e4e7]",
                      )}
                    />
                  </td>
                  <td className={cn(gayaSel, "border-l")}>
                    <p className="truncate">{pasien.nama}</p>
                    <p className="truncate text-xs leading-4 text-muted-foreground">PMO: {pasien.namaPmo}</p>
                  </td>
                  <td className={cn(gayaSel, "border-l whitespace-nowrap")}>
                    {pasien.progres.hariKe} / {pasien.durasiHari} Hari
                  </td>
                  <td className={cn(gayaSel, "border-l whitespace-nowrap")}>
                    {pasien.checkinHariIni ? (
                      jamWIBDari(pasien.checkinHariIni.createdAt)
                    ) : (
                      <span className="text-muted-foreground">Belum check-in</span>
                    )}
                  </td>
                  <td className={cn(gayaSel, "border-l py-2")}>
                    <TagStatus pasien={pasien} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Paginasi */}
      <div className="flex h-[58px] items-center justify-end gap-4 px-2 text-sm leading-[18px] text-black/[0.87] sm:gap-8">
        <label className="flex items-center gap-3">
          <span className="hidden sm:inline">Baris per halaman:</span>
          <select
            value={barisPerHalaman}
            onChange={(e) => onGantiBarisPerHalaman(Number(e.target.value))}
            className="border-b border-black/40 bg-transparent py-1 pr-1 outline-none focus-visible:border-brand-500"
          >
            {PILIHAN_BARIS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <span>
          {awal + 1}-{Math.min(awal + barisPerHalaman, total)} dari {total}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onGantiHalaman(halamanAman - 1)}
            disabled={halamanAman <= 1}
            aria-label="Halaman sebelumnya"
            className="flex size-8 items-center justify-center rounded-full text-black/[0.54] transition hover:bg-muted disabled:text-black/20 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => onGantiHalaman(halamanAman + 1)}
            disabled={halamanAman >= jumlahHalaman}
            aria-label="Halaman berikutnya"
            className="flex size-8 items-center justify-center rounded-full text-black/[0.54] transition hover:bg-muted disabled:text-black/20 disabled:hover:bg-transparent"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
