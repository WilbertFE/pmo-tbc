"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Bot, LoaderCircle, SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Pesan = { peran: "user" | "model"; teks: string };

const CONTOH_PERTANYAAN = [
  "Kalau lupa minum obat, harus bagaimana?",
  "Kenapa air seni saya jadi oranye?",
  "Saya mual setelah minum obat, normal?",
  "Kenapa obat harus diminum sampai habis?",
];

// Chat tanya jawab seputar pengobatan dengan asisten AI
export default function ChatEdukasi() {
  const [daftar, setDaftar] = useState<Pesan[]>([]);
  const [teks, setTeks] = useState("");
  const [memuat, setMemuat] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const bawahRef = useRef<HTMLDivElement>(null);

  // Gulir ke pesan terbaru setiap ada pesan atau potongan jawaban baru
  useEffect(() => {
    bawahRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [daftar]);

  async function kirim(isi: string) {
    const pertanyaan = isi.trim();
    if (!pertanyaan || memuat) return;

    const riwayat: Pesan[] = [...daftar, { peran: "user", teks: pertanyaan }];
    setDaftar([...riwayat, { peran: "model", teks: "" }]);
    setTeks("");
    setGalat(null);
    setMemuat(true);

    try {
      const res = await fetch("/api/pasien/tanya", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pesan: riwayat }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Asisten sedang tidak bisa menjawab.");
      }

      // Tampilkan jawaban sedikit demi sedikit selama diterima
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let jawaban = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        jawaban += decoder.decode(value, { stream: true });
        setDaftar([...riwayat, { peran: "model", teks: jawaban }]);
      }
      if (!jawaban.trim()) throw new Error("Asisten tidak memberi jawaban. Coba tanyakan dengan kalimat lain.");
    } catch (err) {
      // Buang balon jawaban kosong, biarkan pertanyaan supaya bisa dikirim ulang
      setDaftar(riwayat);
      setGalat(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setMemuat(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    kirim(teks);
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-1 flex-col gap-3">
        {daftar.length === 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-muted-foreground">Coba tanyakan salah satu ini:</p>
            {CONTOH_PERTANYAAN.map((contoh) => (
              <button
                key={contoh}
                type="button"
                onClick={() => kirim(contoh)}
                className="rounded-xl border bg-background px-4 py-3 text-left transition hover:bg-muted/50"
              >
                {contoh}
              </button>
            ))}
          </div>
        )}

        {daftar.map((p, i) => (
          <div key={i} className={cn("flex gap-2", p.peran === "user" ? "justify-end" : "justify-start")}>
            {p.peran === "model" && (
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-primary">
                <Bot aria-hidden className="size-5" />
              </span>
            )}
            <div
              className={cn(
                "max-w-[85%] rounded-xl px-4 py-3 whitespace-pre-wrap",
                p.peran === "user" ? "bg-primary text-primary-foreground" : "border bg-background",
              )}
            >
              {p.teks || (
                <span className="flex items-center gap-2 text-muted-foreground">
                  <LoaderCircle aria-hidden className="size-4 animate-spin" />
                  Sedang mengetik...
                </span>
              )}
            </div>
          </div>
        ))}

        {galat && (
          <p role="alert" className="rounded-xl bg-alert-subtle px-4 py-3 text-sm text-[#b3261e]">
            {galat}
          </p>
        )}
        <div ref={bawahRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="sticky bottom-16 flex gap-2 border-t bg-background pt-3 pb-1 md:bottom-0"
      >
        <label htmlFor="pertanyaan" className="sr-only">
          Pertanyaan
        </label>
        <input
          id="pertanyaan"
          value={teks}
          onChange={(e) => setTeks(e.target.value)}
          placeholder="Tulis pertanyaan Anda..."
          maxLength={500}
          autoComplete="off"
          className="h-12 min-w-0 flex-1 rounded-xl bg-muted px-4 text-base outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <Button type="submit" className="h-12 px-4" disabled={memuat || !teks.trim()} aria-label="Kirim">
          <SendHorizontal aria-hidden className="size-5" />
        </Button>
      </form>
    </div>
  );
}
