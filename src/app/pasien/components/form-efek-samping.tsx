"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type TingkatEfekSamping = "ringan" | "sedang" | "berat";

export default function FormEfekSamping() {
  const [jenis, setJenis] = useState("");
  const [tingkat, setTingkat] = useState<TingkatEfekSamping>("ringan");
  const [catatan, setCatatan] = useState("");
  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState<{
    tipe: "sukses" | "error";
    teks: string;
  } | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!jenis.trim()) {
      setPesan({ tipe: "error", teks: "Jenis efek samping harus diisi." });
      return;
    }

    setLoading(true);
    setPesan(null);

    try {
      const response = await fetch("/api/efek-samping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jenis: jenis.trim(),
          tingkat,
          catatan: catatan.trim() || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Gagal menyimpan laporan.");
      }

      setPesan({
        tipe: "sukses",
        teks: "Laporan efek samping berhasil dikirim.",
      });
      setJenis("");
      setTingkat("ringan");
      setCatatan("");

      // Refresh untuk memperbarui daftar riwayat
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setPesan({
        tipe: "error",
        teks: err instanceof Error ? err.message : "Terjadi kesalahan.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label className="text-sm font-semibold">Keluhan / Jenis Efek Samping</Label>
        <Input
          type="text"
          value={jenis}
          onChange={(e) => setJenis(e.target.value)}
          placeholder="Contoh: Mual, Pusing, Gatal-gatal"
          className="h-12 rounded-xl bg-background"
          required
        />
      </div>

      <div className="flex flex-col gap-3">
        <Label className="text-sm font-semibold">Tingkat Keparahan</Label>
        <div className="grid grid-cols-3 gap-2">
          {(["ringan", "sedang", "berat"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTingkat(t)}
              className={cn(
                "flex h-12 items-center justify-center rounded-xl border text-sm font-medium transition-colors",
                tingkat === t
                  ? t === "ringan"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : t === "sedang"
                    ? "border-amber-500 bg-amber-50 text-amber-700"
                    : "border-red-500 bg-red-50 text-red-700"
                  : "border-border bg-background text-muted-foreground hover:bg-muted"
              )}
            >
              <span className="capitalize">{t}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {tingkat === "ringan" && "Keluhan ringan yang tidak mengganggu aktivitas harian."}
          {tingkat === "sedang" && "Cukup mengganggu, tapi masih bisa beraktivitas."}
          {tingkat === "berat" && "Sangat mengganggu, tidak bisa beraktivitas, butuh penanganan nakes segera."}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-sm font-semibold">Catatan Tambahan (Opsional)</Label>
        <textarea
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          placeholder="Beri detail lebih lanjut jika diperlukan..."
          className="min-h-[100px] w-full resize-y rounded-xl border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          maxLength={500}
        />
      </div>

      {pesan && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            pesan.tipe === "sukses"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {pesan.teks}
        </div>
      )}

      <Button
        type="submit"
        disabled={loading || !jenis.trim()}
        className="h-12 w-full rounded-xl font-semibold transition-all active:scale-[0.98]"
      >
        {loading ? "Mengirim..." : "Kirim Laporan"}
      </Button>
    </form>
  );
}
