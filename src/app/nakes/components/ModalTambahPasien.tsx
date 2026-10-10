"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Info, UserPlus, X } from "lucide-react";
import { tanggalWIB } from "@/lib/tanggal";

interface ModalTambahPasienProps {
  onClose: () => void;
  onSuksesTambah: () => void;
}

// Menghubungkan akun yang sudah mendaftar sendiri ke data pengobatan baru
export function ModalTambahPasien({ onClose, onSuksesTambah }: ModalTambahPasienProps) {
  const [email, setEmail] = useState("");
  const [emailPmo, setEmailPmo] = useState("");
  const [tanggalMulai, setTanggalMulai] = useState(() => tanggalWIB());
  const [jamMinum, setJamMinum] = useState("07:00");
  const [durasiHari, setDurasiHari] = useState("180");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setPesanError(null);

    try {
      const res = await fetch("/api/nakes/tambah-pasien", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          emailPmo: emailPmo.trim(),
          tanggalMulai,
          jamMinum,
          durasiHari: Number(durasiHari),
        }),
      });

      const hasil = await res.json();
      if (!res.ok) {
        throw new Error(hasil.error || "Gagal menambah pasien");
      }

      onSuksesTambah();
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
        aria-labelledby="judul-tambah-pasien"
        className="relative w-full max-w-lg bg-background rounded-2xl shadow-2xl border overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 id="judul-tambah-pasien" className="font-semibold text-lg flex items-center gap-2">
              <UserPlus className="size-5 text-primary" />
              Tambah Pasien
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Hubungkan akun yang sudah mendaftar dengan jadwal pengobatan.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:bg-muted transition"
            aria-label="Tutup"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          {/* Isi Modal */}
          <div className="p-4 flex-1 overflow-y-auto space-y-4">
            <div className="p-3 rounded-lg bg-info-subtle text-xs text-foreground flex gap-2">
              <Info className="size-4 shrink-0 text-info" />
              <span>
                Pasien dan PMO harus sudah mendaftar di halaman Daftar. Email mereka tampil di layar
                &quot;Akun Anda sedang disiapkan&quot; setelah mendaftar.
              </span>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tambah-email" className="text-xs font-medium">
                Email pasien
              </Label>
              <Input
                id="tambah-email"
                type="email"
                inputMode="email"
                autoComplete="off"
                placeholder="contoh: budi@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tambah-email-pmo" className="text-xs font-medium">
                Email PMO <span className="font-normal text-muted-foreground">(opsional)</span>
              </Label>
              <Input
                id="tambah-email-pmo"
                type="email"
                inputMode="email"
                autoComplete="off"
                placeholder="Anggota keluarga yang mengawasi minum obat"
                value={emailPmo}
                onChange={(e) => setEmailPmo(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="tambah-tanggal" className="text-xs font-medium">
                  Tanggal mulai
                </Label>
                <Input
                  id="tambah-tanggal"
                  type="date"
                  value={tanggalMulai}
                  onChange={(e) => setTanggalMulai(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tambah-jam" className="text-xs font-medium">
                  Jam minum (WIB)
                </Label>
                <Input
                  id="tambah-jam"
                  type="time"
                  value={jamMinum}
                  onChange={(e) => setJamMinum(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tambah-durasi" className="text-xs font-medium">
                  Durasi (hari)
                </Label>
                <Input
                  id="tambah-durasi"
                  type="number"
                  min={1}
                  max={730}
                  value={durasiHari}
                  onChange={(e) => setDurasiHari(e.target.value)}
                  required
                />
              </div>
            </div>

            {pesanError && (
              <div role="alert" className="p-2.5 rounded-lg bg-red-500/10 text-red-600 text-xs flex items-center gap-2">
                <AlertTriangle className="size-4 shrink-0" />
                <span>{pesanError}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t bg-muted/10 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting || !email.trim()} className="flex items-center gap-1.5">
              <UserPlus className="size-3.5" />
              {isSubmitting ? "Menyimpan..." : "Tambah Pasien"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
