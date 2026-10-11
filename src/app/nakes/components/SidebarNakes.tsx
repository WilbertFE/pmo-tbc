"use client";

import { ClipboardList, HeartPulse, LogOut, RotateCw, Search, TrendingUp, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarNakesProps {
  namaNakes: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onTambahPasien: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

const gayaItem =
  "flex h-[38px] w-full items-center gap-2.5 rounded-sm px-2.5 text-sm leading-[18px] text-foreground transition hover:bg-white hover:shadow-[0px_2px_6px_0px_rgba(0,0,0,0.06)] focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none";

// Sidebar kiri dashboard (desktop), sesuai desain Figma "Portal Nakes"
export function SidebarNakes({
  namaNakes,
  searchQuery,
  onSearchChange,
  onTambahPasien,
  onRefresh,
  isLoading,
}: SidebarNakesProps) {
  return (
    <aside className="sticky top-4 hidden h-[calc(100svh-2rem)] w-[285px] shrink-0 flex-col gap-4 lg:flex">
      {/* Identitas */}
      <div className="flex h-20 items-center gap-2.5 rounded-sm bg-white/90 p-2.5 shadow-[0px_2px_6px_0px_rgba(0,0,0,0.06)]">
        <span className="flex size-[60px] items-center justify-center rounded-sm bg-brand-500 text-white">
          <HeartPulse aria-hidden className="size-7" />
        </span>
        <div className="min-w-0">
          <p className="text-sm leading-[18px] text-foreground">Portal Nakes</p>
          <p className="truncate text-xs leading-4 text-muted-foreground">Pendamping Minum Obat</p>
        </div>
      </div>

      {/* Pencarian */}
      <label className="flex h-[47px] items-center gap-2.5 rounded-md bg-muted px-2.5 focus-within:ring-3 focus-within:ring-ring/50">
        <Search aria-hidden className="size-[17px] shrink-0 text-foreground" />
        <span className="sr-only">Cari pasien</span>
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari pasien atau PMO"
          className="w-full bg-transparent text-sm leading-[18px] text-foreground outline-none placeholder:text-muted-foreground"
        />
      </label>

      <nav aria-label="Menu dashboard" className="flex flex-1 flex-col gap-8">
        <div className="flex flex-col gap-2 px-2">
          <p className="text-xs leading-4 text-muted-foreground">Menu Utama</p>
          <a
            href="#daftar-pasien"
            aria-current="page"
            className={cn(gayaItem, "bg-white shadow-[0px_2px_6px_0px_rgba(0,0,0,0.06)]")}
          >
            <ClipboardList aria-hidden className="size-[17px]" />
            Pemantauan Pasien
          </a>
          <a href="#grafik-kepatuhan" className={gayaItem}>
            <TrendingUp aria-hidden className="size-[17px]" />
            Tingkat Kepatuhan
          </a>
        </div>

        <div className="h-px bg-border" />

        <div className="flex flex-col gap-2 px-2">
          <p className="text-xs leading-4 text-muted-foreground">Alat</p>
          <button type="button" onClick={onTambahPasien} className={gayaItem}>
            <UserPlus aria-hidden className="size-[17px]" />
            Tambah Pasien
          </button>
          <button type="button" onClick={onRefresh} disabled={isLoading} className={cn(gayaItem, "disabled:opacity-60")}>
            <RotateCw aria-hidden className={cn("size-[17px]", isLoading && "animate-spin")} />
            Perbarui Data
          </button>
        </div>
      </nav>

      {/* Akun */}
      <div className="flex items-center justify-between gap-2 rounded-sm bg-white/90 p-2.5 shadow-[0px_2px_6px_0px_rgba(0,0,0,0.06)]">
        <div className="min-w-0">
          <p className="truncate text-sm leading-[18px] font-medium text-foreground">{namaNakes}</p>
          <p className="text-xs leading-4 text-muted-foreground">Petugas puskesmas</p>
        </div>
        <form action="/api/auth/logout" method="post">
          <button
            type="submit"
            className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-sm text-muted-foreground transition hover:bg-alert-subtle hover:text-alert focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <LogOut aria-hidden className="size-4" />
            Keluar
          </button>
        </form>
      </div>
    </aside>
  );
}
