"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, LoaderCircle, RotateCw, Sparkles, X } from "lucide-react";
import type { SaranCekAi } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";

type HasilCekAi = {
  saran: SaranCekAi;
  wajah_terlihat: boolean;
  obat_terlihat: boolean;
  menelan_terlihat: boolean;
  alasan: string;
};

const TAMPILAN_SARAN: Record<SaranCekAi, { label: string; kelas: string }> = {
  kemungkinan_valid: { label: "Kemungkinan valid", kelas: "bg-success-subtle text-[#0b7a5a]" },
  perlu_dicek: { label: "Perlu dicek", kelas: "bg-warning-subtle text-[#a35f00]" },
  kemungkinan_tidak_valid: { label: "Kemungkinan tidak valid", kelas: "bg-alert-subtle text-[#b3261e]" },
};

function Butir({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-center gap-1.5">
      {ok ? (
        <Check aria-hidden className="size-3.5 text-[#0b7a5a]" />
      ) : (
        <X aria-hidden className="size-3.5 text-[#b3261e]" />
      )}
      <span className={ok ? "text-foreground" : "text-muted-foreground"}>
        {label}
        <span className="sr-only">{ok ? ": terlihat" : ": tidak terlihat"}</span>
      </span>
    </li>
  );
}

// Saran AI untuk bukti check-in. Dimuat otomatis saat modal tinjau dibuka.
export function KartuCekAi({ checkinId }: { checkinId: string }) {
  const [hasil, setHasil] = useState<HasilCekAi | null>(null);
  const [memuat, setMemuat] = useState(true);
  const [galat, setGalat] = useState<string | null>(null);
  const [percobaan, setPercobaan] = useState(0);

  const cobaLagi = useCallback(() => {
    setGalat(null);
    setMemuat(true);
    setPercobaan((n) => n + 1);
  }, []);

  useEffect(() => {
    let dibatalkan = false;
    fetch("/api/nakes/cek-ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checkinId }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.error ?? "Cek AI gagal");
        if (!dibatalkan) setHasil(data.hasil);
      })
      .catch((err: unknown) => {
        if (!dibatalkan) setGalat(err instanceof Error ? err.message : "Cek AI gagal");
      })
      .finally(() => {
        if (!dibatalkan) setMemuat(false);
      });
    return () => {
      dibatalkan = true;
    };
  }, [checkinId, percobaan]);

  return (
    <section aria-label="Cek awal AI" className="rounded-md border p-3 text-xs">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 font-medium text-foreground">
          <Sparkles aria-hidden className="size-3.5 text-primary" />
          Cek awal AI
        </span>
        {hasil && (
          <span className={cn("rounded-full px-2 leading-5", TAMPILAN_SARAN[hasil.saran].kelas)}>
            {TAMPILAN_SARAN[hasil.saran].label}
          </span>
        )}
      </div>

      {memuat ? (
        <p className="flex items-center gap-2 text-muted-foreground">
          <LoaderCircle aria-hidden className="size-3.5 animate-spin" />
          AI sedang memeriksa bukti...
        </p>
      ) : galat ? (
        <div className="flex items-center justify-between gap-2">
          <p className="text-muted-foreground">{galat}</p>
          <button
            type="button"
            onClick={cobaLagi}
            className="flex shrink-0 items-center gap-1 rounded-sm px-2 py-1 text-primary hover:bg-muted"
          >
            <RotateCw aria-hidden className="size-3.5" />
            Coba lagi
          </button>
        </div>
      ) : hasil ? (
        <>
          <ul className="mb-2 flex flex-wrap gap-x-4 gap-y-1">
            <Butir ok={hasil.wajah_terlihat} label="Wajah" />
            <Butir ok={hasil.obat_terlihat} label="Obat" />
            <Butir ok={hasil.menelan_terlihat} label="Menelan" />
          </ul>
          <p className="text-foreground">{hasil.alasan}</p>
          <p className="mt-2 text-muted-foreground">Ini hanya saran. Keputusan tetap di tangan petugas.</p>
        </>
      ) : null}
    </section>
  );
}
