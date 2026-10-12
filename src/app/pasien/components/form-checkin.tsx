"use client";

import { useState, useRef, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Camera, ImageUp, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import PerekamVideo from "./perekam-video";

type FormCheckinProps = {
  pasienId: string;
  tanggalHariIni: string;
  sudahCheckin: boolean;
};

const MAKS_UKURAN_MB = 50;
const MAKS_UKURAN_BYTES = MAKS_UKURAN_MB * 1024 * 1024;
// Harus sama dengan allowed_mime_types bucket checkin-media (migrasi 004)
const EKSTENSI_VALID = ["mp4", "webm", "mov", "jpg", "jpeg", "png", "webp"];
const TIPE_FILE_DITERIMA = "video/mp4,video/webm,video/quicktime,image/jpeg,image/png,image/webp";

export default function FormCheckin({
  pasienId,
  tanggalHariIni,
  sudahCheckin,
}: FormCheckinProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [catatan, setCatatan] = useState("");
  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState<{
    tipe: "sukses" | "error";
    teks: string;
  } | null>(null);
  const [merekam, setMerekam] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const fotoRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    pilihFile(selected);
  }

  function pilihFile(selected: File) {
    // Validasi ukuran
    if (selected.size > MAKS_UKURAN_BYTES) {
      setPesan({
        tipe: "error",
        teks: `Ukuran file terlalu besar (maks ${MAKS_UKURAN_MB} MB).`,
      });
      return;
    }

    // Validasi ekstensi
    const ext = selected.name.split(".").pop()?.toLowerCase() ?? "";
    if (ext === "heic" || ext === "heif") {
      setPesan({
        tipe: "error",
        teks: "Foto HEIC belum didukung. Pakai tombol Ambil Foto atau Rekam Video di atas.",
      });
      return;
    }
    if (!EKSTENSI_VALID.includes(ext)) {
      setPesan({
        tipe: "error",
        teks: `Format file tidak didukung. Gunakan: ${EKSTENSI_VALID.join(", ")}.`,
      });
      return;
    }

    setFile(selected);
    setPesan(null);
    setMerekam(false);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(selected));
  }

  function handleRemoveFile() {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
    if (fotoRef.current) fotoRef.current.value = "";
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file) {
      setPesan({ tipe: "error", teks: "Pilih file bukti terlebih dahulu." });
      return;
    }

    setLoading(true);
    setPesan(null);

    try {
      const supabase = createClient();

      // 1. Upload langsung ke Supabase Storage (bukan lewat API route)
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "webm";
      const mediaPath = `${pasienId}/${tanggalHariIni}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("checkin-media")
        .upload(mediaPath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        throw new Error(`Gagal mengunggah file: ${uploadError.message}`);
      }

      // 2. Simpan data check-in lewat API route
      const response = await fetch("/api/pasien/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pasien_id: pasienId,
          tanggal: tanggalHariIni,
          media_path: mediaPath,
          catatan: catatan.trim() || null,
        }),
      });

      if (!response.ok) {
        let pesanError = "Gagal menyimpan data check-in.";
        try {
          const data = await response.json();
          if (data?.error) pesanError = data.error;
        } catch {
          // Response bukan JSON
        }
        throw new Error(pesanError);
      }

      setPesan({
        tipe: "sukses",
        teks: "Check-in berhasil dikirim! Menunggu verifikasi dari petugas kesehatan.",
      });
      setFile(null);
      setPreview(null);
      setCatatan("");
      if (inputRef.current) inputRef.current.value = "";

      // Kembali ke beranda yang menampilkan status dan progres terbaru
      setTimeout(() => {
        router.push("/pasien");
        router.refresh();
      }, 1500);
    } catch (err) {
      setPesan({
        tipe: "error",
        teks:
          err instanceof Error ? err.message : "Terjadi kesalahan saat mengirim.",
      });
    } finally {
      setLoading(false);
    }
  }

  // Kalau sudah check-in hari ini
  if (sudahCheckin) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <svg
            className="h-8 w-8 text-emerald-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </div>
        <div>
          <p className="text-base font-semibold text-foreground">
            Sudah check-in hari ini
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Laporan kamu sedang menunggu verifikasi. Terima kasih sudah konsisten!
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Upload Bukti */}
      <div className="flex flex-col gap-2">
        <Label className="text-base font-semibold">Bukti Minum Obat</Label>
        <p className="text-sm text-muted-foreground">
          Rekam video singkat atau ambil foto saat minum obat.
        </p>

        {merekam ? (
          <PerekamVideo onPakai={pilihFile} onBatal={() => setMerekam(false)} />
        ) : file && preview ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border bg-muted/30 p-4">
            {file.type.startsWith("video/") ? (
              <video src={preview} controls playsInline className="max-h-64 w-full rounded-lg bg-black" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Pratinjau bukti" className="max-h-64 w-auto rounded-lg object-contain" />
            )}
            <p className="text-xs text-muted-foreground">
              {(file.size / (1024 * 1024)).toFixed(1)} MB
            </p>
            <Button type="button" variant="outline" onClick={handleRemoveFile}>
              Ganti bukti
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <Button type="button" className="h-14 w-full text-lg" onClick={() => setMerekam(true)}>
              <Video aria-hidden className="size-6" />
              Rekam Video
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-14 w-full text-lg"
              onClick={() => fotoRef.current?.click()}
            >
              <Camera aria-hidden className="size-6" />
              Ambil Foto
            </Button>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mx-auto flex items-center gap-2 py-2 text-sm text-muted-foreground underline-offset-4 hover:underline"
            >
              <ImageUp aria-hidden className="size-4" />
              Pilih dari galeri (MP4, WebM, MOV, JPG, PNG, maks {MAKS_UKURAN_MB} MB)
            </button>
          </div>
        )}

        <input
          ref={fotoRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="user"
          onChange={handleFileChange}
          className="hidden"
        />
        <input
          ref={inputRef}
          type="file"
          accept={TIPE_FILE_DITERIMA}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Keluhan / Catatan */}
      <div className="flex flex-col gap-2">
        <Label className="text-base font-semibold">Keluhan</Label>
        <p className="text-sm text-muted-foreground">
          Catatan Tambahan (Opsional)
        </p>
        <textarea
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          placeholder="Contoh: Ada efek samping ringan berupa mual, dll."
          className="min-h-[120px] w-full resize-y rounded-xl border border-input bg-transparent px-4 py-3 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          maxLength={500}
        />
      </div>

      {/* Info Penting */}
      <div className="rounded-xl border border-sky-200 bg-sky-50/50 p-4">
        <div className="mb-2 flex items-center gap-2">
          <svg
            className="h-5 w-5 text-sky-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
            />
          </svg>
          <span className="text-sm font-semibold text-sky-700">
            Informasi Penting
          </span>
        </div>
        <ul className="space-y-1 text-sm text-sky-800">
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-sky-600" />
            Pastikan wajah dan obat terlihat jelas saat merekam bukti check-in
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-sky-600" />
            Batas waktu check-in harian adalah pukul 23:59 setiap harinya
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-sky-600" />
            Jika kamu mengalami efek samping berat, nakes akan segera menghubungi
            kamu
          </li>
        </ul>
      </div>

      {/* Pesan Status */}
      {pesan && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${pesan.tipe === "sukses"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
            }`}
        >
          {pesan.teks}
        </div>
      )}

      {/* Tombol Submit */}
      <Button
        type="submit"
        disabled={loading || !file}
        className="h-12 w-full rounded-xl bg-emerald-600 text-base font-semibold text-white transition-all hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg
              className="h-5 w-5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Mengirim...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            Kirim Laporan
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              />
            </svg>
          </span>
        )}
      </Button>
    </form>
  );
}
