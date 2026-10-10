"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ClipboardList, X, Send, History, AlertTriangle } from "lucide-react";
import type { PasienNakes } from "./types";

interface ModalTindakLanjutProps {
  pasien: PasienNakes | null;
  onClose: () => void;
  onSuksesSimpan: () => void;
}

export function ModalTindakLanjut({
  pasien,
  onClose,
  onSuksesSimpan,
}: ModalTindakLanjutProps) {
  const [catatan, setCatatan] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);

  if (!pasien) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catatan.trim()) return;

    setIsSubmitting(true);
    setPesanError(null);

    try {
      const res = await fetch("/api/nakes/tindak-lanjut", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pasienId: pasien.id,
          catatan: catatan.trim(),
        }),
      });

      const hasil = await res.json();
      if (!res.ok) {
        throw new Error(hasil.error || "Gagal menyimpan catatan");
      }

      setCatatan("");
      onSuksesSimpan();
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
              <ClipboardList className="size-5 text-primary" />
              Catatan Tindak Lanjut
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Pasien: <span className="font-medium text-foreground">{pasien.nama}</span> | Status:{" "}
              <span className={`font-semibold uppercase ${
                pasien.status === "merah" ? "text-red-600" : pasien.status === "kuning" ? "text-amber-600" : "text-emerald-600"
              }`}>
                {pasien.status}
              </span>
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

        {/* Isi Modal */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          {/* Form Tambah Catatan */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label htmlFor="catatan-tindak-lanjut" className="text-xs font-medium">
                Tulis Tindak Lanjut / Intervensi
              </Label>
              <textarea
                id="catatan-tindak-lanjut"
                rows={3}
                placeholder="Contoh: Sudah ditelepon via PMO, obat terlambat karena pasien lembur kerja. Diingatkan untuk segera minum obat malam ini."
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                required
                className="w-full mt-1.5 p-3 text-sm rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
            </div>

            {pesanError && (
              <div className="p-2.5 rounded-lg bg-red-500/10 text-red-600 text-xs flex items-center gap-2">
                <AlertTriangle className="size-4 shrink-0" />
                <span>{pesanError}</span>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || !catatan.trim()}
                className="flex items-center gap-1.5"
              >
                <Send className="size-3.5" />
                {isSubmitting ? "Menyimpan..." : "Simpan Catatan"}
              </Button>
            </div>
          </form>

          {/* Riwayat Catatan Sebelumnya */}
          <div className="pt-3 border-t space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <History className="size-3.5" />
              Riwayat Tindak Lanjut ({pasien.riwayatTindakLanjut?.length || 0})
            </h4>

            {pasien.riwayatTindakLanjut && pasien.riwayatTindakLanjut.length > 0 ? (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {pasien.riwayatTindakLanjut.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg bg-muted/40 border text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                      <span>Petugas Puskesmas</span>
                      <span>
                        {new Date(item.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })} WIB
                      </span>
                    </div>
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                      {item.catatan}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic py-2 text-center bg-muted/20 rounded-lg">
                Belum ada catatan tindak lanjut sebelumnya untuk pasien ini.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t bg-muted/10 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
}
