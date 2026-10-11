"use client";

import { Clock, Plus, RotateCw, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterPasienProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  hanyaMenunggu: boolean;
  onToggleMenunggu: () => void;
  jumlahMenunggu: number;
  onRefresh: () => void;
  isLoading: boolean;
  onTambahPasien: () => void;
}

// Tombol sekunder sesuai desain: tinggi 32px, radius 8px, teks hijau
export const gayaTombolSekunder =
  "inline-flex h-8 min-w-[110px] shrink-0 items-center justify-center gap-1.5 rounded-[8px] border border-muted bg-[#fcfcfc] px-3.5 text-sm leading-[22px] font-medium text-primary transition hover:bg-brand-50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:opacity-60";

// Toolbar di atas tabel pasien
export function FilterPasien({
  searchQuery,
  onSearchChange,
  hanyaMenunggu,
  onToggleMenunggu,
  jumlahMenunggu,
  onRefresh,
  isLoading,
  onTambahPasien,
}: FilterPasienProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        {/* Pencarian untuk layar kecil, di desktop ada di sidebar */}
        <label className="flex h-8 w-full items-center gap-2 rounded-[8px] bg-muted px-3 sm:w-56 lg:hidden">
          <Search aria-hidden className="size-4 shrink-0 text-muted-foreground" />
          <span className="sr-only">Cari pasien</span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari pasien atau PMO"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </label>
        <button
          type="button"
          onClick={onToggleMenunggu}
          aria-pressed={hanyaMenunggu}
          className={cn(gayaTombolSekunder, hanyaMenunggu && "border-brand-500 bg-brand-50")}
        >
          <Clock aria-hidden className="size-[18px]" />
          Menunggu Verifikasi
          <span className="rounded-full bg-brand-500 px-1.5 text-xs leading-5 text-white">{jumlahMenunggu}</span>
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button type="button" onClick={onRefresh} disabled={isLoading} className={gayaTombolSekunder}>
          <RotateCw aria-hidden className={cn("size-[18px]", isLoading && "animate-spin")} />
          Perbarui
        </button>
        <button
          type="button"
          onClick={onTambahPasien}
          className="inline-flex h-8 min-w-[110px] shrink-0 items-center justify-center gap-1.5 rounded-[8px] border border-brand-500 bg-brand-500 px-3.5 text-sm leading-[22px] font-medium text-[#fafafa] transition hover:bg-brand-600 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <Plus aria-hidden className="size-[18px]" />
          Tambah Pasien
        </button>
      </div>
    </div>
  );
}
