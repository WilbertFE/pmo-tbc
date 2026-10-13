"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, AlertTriangle, ShieldCheck, Clock, FileVideo, LoaderCircle } from "lucide-react";
import type { PasienNakes, RiwayatCheckin } from "./types";
import { jamWIBDari, LABEL_VERIFIKASI, tanggalPendek } from "./status-tampilan";
import { useTutupDenganEsc } from "./useTutupDenganEsc";
import { KartuCekAi } from "./KartuCekAi";

export type CheckinDitinjau = RiwayatCheckin & { signedMediaUrl?: string | null };

interface ModalVerifikasiProps {
  pasien: PasienNakes;
  // Check-in yang ditinjau (hari ini atau hari sebelumnya dari riwayat)
  checkin: CheckinDitinjau;
  onClose: () => void;
  onSuksesVerifikasi: () => void;
}

export function ModalVerifikasi({ pasien, checkin, onClose, onSuksesVerifikasi }: ModalVerifikasiProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [urlMedia, setUrlMedia] = useState<string | null>(checkin.signedMediaUrl ?? null);
  const [memuatMedia, setMemuatMedia] = useState(!checkin.signedMediaUrl && Boolean(checkin.mediaPath));

  useTutupDenganEsc(onClose);

  // Check-in dari riwayat belum punya signed URL: ambil saat modal dibuka
  useEffect(() => {
    if (checkin.signedMediaUrl || !checkin.mediaPath) return;
    let dibatalkan = false;
    fetch(`/api/nakes/media?checkinId=${encodeURIComponent(checkin.id)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!dibatalkan) setUrlMedia(data.signedUrl ?? null);
      })
      .catch(() => {})
      .finally(() => {
        if (!dibatalkan) setMemuatMedia(false);
      });
    return () => {
      dibatalkan = true;
    };
  }, [checkin.id, checkin.mediaPath, checkin.signedMediaUrl]);

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
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="judul-verifikasi"
        className="relative w-full max-w-lg bg-background rounded-md shadow-[0px_6px_18px_0px_rgba(0,0,0,0.12)] border border-[#d4d4d8] overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 id="judul-verifikasi" className="text-xl leading-6 font-medium flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" />
              Tinjau Bukti Check-in
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Pasien: <span className="font-medium text-foreground">{pasien.nama}</span> | PMO: {pasien.namaPmo}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            autoFocus
            className="p-1 rounded-lg text-muted-foreground hover:bg-muted transition"
            aria-label="Tutup"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Isi Modal: Preview Media */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          <div className="bg-black/90 rounded-md overflow-hidden flex items-center justify-center min-h-[260px] max-h-[380px]">
            {memuatMedia ? (
              <LoaderCircle aria-label="Memuat media" className="size-8 animate-spin text-white/70" />
            ) : urlMedia ? (
              isVideo ? (
                <video src={urlMedia} controls autoPlay playsInline className="w-full max-h-[360px] object-contain" />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={urlMedia} alt="Bukti foto minum obat" className="w-full max-h-[360px] object-contain" />
              )
            ) : (
              <div className="text-center p-6 text-zinc-400">
                <FileVideo className="size-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Media bukti tidak ditemukan atau link kedaluwarsa</p>
              </div>
            )}
          </div>

          {/* Info Status Saat Ini */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-muted p-3 rounded-md text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="size-3.5" />
              Diunggah:{" "}
              <span className="font-medium text-foreground">
                {tanggalPendek(checkin.tanggal)}, {jamWIBDari(checkin.createdAt)}
              </span>
            </div>
            <div>
              Status:{" "}
              <span
                className={`rounded-full px-2 text-xs leading-5 ${
                  checkin.status === "terverifikasi"
                    ? "bg-success-subtle text-[#0b7a5a]"
                    : checkin.status === "ditolak"
                      ? "bg-alert-subtle text-[#b3261e]"
                      : "bg-info-subtle text-[#1f6fa8]"
                }`}
              >
                {LABEL_VERIFIKASI[checkin.status]}
              </span>
            </div>
          </div>

          {checkin.mediaPath && <KartuCekAi checkinId={checkin.id} />}

          {pesanError && (
            <div role="alert" className="p-3 rounded-lg bg-alert-subtle text-[#b3261e] text-xs flex items-center gap-2">
              <AlertTriangle className="size-4 shrink-0" />
              <span>{pesanError}</span>
            </div>
          )}
        </div>

        {/* Footer Modal: Tombol Verifikasi & Tolak */}
        <div className="p-4 border-t bg-muted/10 flex items-center justify-between gap-3">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleProses("ditolak")}
              disabled={isSubmitting || checkin.status === "ditolak"}
              className="flex items-center gap-1.5"
            >
              <X className="size-4" />
              Tolak Bukti
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => handleProses("terverifikasi")}
              disabled={isSubmitting || checkin.status === "terverifikasi"}
              className="flex items-center gap-1.5"
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
