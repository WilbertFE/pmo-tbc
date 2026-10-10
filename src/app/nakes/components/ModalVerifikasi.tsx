"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, AlertTriangle, ShieldCheck, Clock, FileVideo } from "lucide-react";
import type { PasienNakes } from "./types";

interface ModalVerifikasiProps {
  pasien: PasienNakes | null;
  onClose: () => void;
  onSuksesVerifikasi: () => void;
}

export function ModalVerifikasi({
  pasien,
  onClose,
  onSuksesVerifikasi,
}: ModalVerifikasiProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);

  if (!pasien || !pasien.checkinHariIni) return null;

  const checkin = pasien.checkinHariIni;
  const isVideo = checkin.mediaPath?.match(/\.(mp4|webm|mov|quicktime)$/i);

  const handleProses = async (status: "terverifikasi" | "ditolak") => {
    setIsSubmitting(true);
    setPesanError(null);

    try {
      const res = await fetch("/api/nakes/verifikasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkinId: checkin.id,
          status,
        }),
      });

      const hasil = await res.json();
      if (!res.ok) {
        throw new Error(hasil.error || "Gagal memproses verifikasi");
      }

      onSuksesVerifikasi();
      onClose();
    } catch (err: unknown) {
      setPesanError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-background rounded-2xl shadow-2xl border overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" />
              Tinjau Bukti Check-in
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Pasien: <span className="font-medium text-foreground">{pasien.nama}</span> | PMO: {pasien.namaPmo}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:bg-muted transition"
            aria-label="Tutup"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Isi Modal: Preview Media */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          <div className="bg-black/90 rounded-xl overflow-hidden flex items-center justify-center min-h-[260px] max-h-[380px]">
            {checkin.signedMediaUrl ? (
              isVideo ? (
                <video
                  src={checkin.signedMediaUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-full max-h-[360px] object-contain"
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={checkin.signedMediaUrl}
                  alt="Bukti foto minum obat"
                  className="w-full max-h-[360px] object-contain"
                />
              )
            ) : (
              <div className="text-center p-6 text-zinc-400">
                <FileVideo className="size-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Media bukti tidak ditemukan atau link kedaluwarsa</p>
              </div>
            )}
          </div>

          {/* Info Status Saat Ini */}
          <div className="flex items-center justify-between bg-muted/40 p-3 rounded-lg text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="size-3.5" />
              Waktu Unggah:{" "}
              <span className="font-medium text-foreground">
                {new Date(checkin.createdAt).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })} WIB
              </span>
            </div>
            <div>
              Status Saat Ini:{" "}
              <span className="font-semibold uppercase px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                {checkin.status}
              </span>
            </div>
          </div>

          {pesanError && (
            <div className="p-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertTriangle className="size-4 shrink-0" />
              <span>{pesanError}</span>
            </div>
          )}
        </div>

        {/* Footer Modal: Tombol Verifikasi & Tolak */}
        <div className="p-4 border-t bg-muted/10 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Batal
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleProses("ditolak")}
              disabled={isSubmitting}
              className="flex items-center gap-1.5"
            >
              <X className="size-4" />
              Tolak Bukti
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => handleProses("terverifikasi")}
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
            >
              <Check className="size-4" />
              Verifikasi Valid
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
