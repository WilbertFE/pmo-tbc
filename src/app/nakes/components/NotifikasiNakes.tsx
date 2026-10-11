"use client";

import { AlertCircle, FileVideo, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Notifikasi {
  id: number;
  jenis: "checkin" | "darurat";
  judul: string;
  isi: string;
  pasienId: string;
}

interface NotifikasiNakesProps {
  daftar: Notifikasi[];
  onTutup: (id: number) => void;
  onBuka: (notifikasi: Notifikasi) => void;
}

// Notifikasi eskalasi di pojok kanan bawah dashboard (dari event realtime)
export function NotifikasiNakes({ daftar, onTutup, onBuka }: NotifikasiNakesProps) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-4 bottom-4 z-40 flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2"
    >
      {daftar.map((n) => {
        const darurat = n.jenis === "darurat";
        const Ikon = darurat ? AlertCircle : FileVideo;
        return (
          <div
            key={n.id}
            role="status"
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-md border bg-white p-3 shadow-[0px_6px_18px_0px_rgba(0,0,0,0.12)] animate-in fade-in slide-in-from-bottom-2",
              darurat ? "border-alert/40" : "border-[#d4d4d8]",
            )}
          >
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full",
                darurat ? "bg-alert-subtle text-alert" : "bg-brand-50 text-primary",
              )}
            >
              <Ikon aria-hidden className="size-4" />
            </span>
            <button
              type="button"
              onClick={() => onBuka(n)}
              className="flex min-w-0 flex-1 flex-col gap-0.5 text-left focus-visible:outline-none"
            >
              <span className="text-sm leading-[18px] font-medium text-foreground">{n.judul}</span>
              <span className="text-xs leading-4 text-muted-foreground">{n.isi}</span>
            </button>
            <button
              type="button"
              onClick={() => onTutup(n.id)}
              aria-label="Tutup notifikasi"
              className="rounded-md p-1 text-muted-foreground hover:bg-muted"
            >
              <X className="size-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
