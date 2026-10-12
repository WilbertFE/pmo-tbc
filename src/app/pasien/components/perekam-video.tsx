"use client";

import { useEffect, useRef, useState } from "react";
import { Circle, RotateCcw, Square, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const DURASI_MAKS_DETIK = 15;

// Format yang diterima bucket checkin-media. Chrome dan Firefox merekam webm, Safari mp4.
const FORMAT_REKAMAN = [
  { mime: "video/webm;codecs=vp8,opus", ext: "webm" },
  { mime: "video/webm", ext: "webm" },
  { mime: "video/mp4", ext: "mp4" },
];

function pilihFormat() {
  if (typeof MediaRecorder === "undefined") return null;
  return FORMAT_REKAMAN.find((f) => MediaRecorder.isTypeSupported(f.mime)) ?? null;
}

async function bukaKamera() {
  const video = { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } };
  try {
    return await navigator.mediaDevices.getUserMedia({ video, audio: true });
  } catch {
    // Sebagian perangkat menolak mikrofon, video saja sudah cukup sebagai bukti
    return await navigator.mediaDevices.getUserMedia({ video });
  }
}

type Tahap = "memuat" | "siap" | "merekam" | "selesai" | "gagal";

type PerekamVideoProps = {
  onPakai: (file: File) => void;
  onBatal: () => void;
};

// Rekam video bukti minum obat langsung dari kamera depan, maksimal 15 detik
export default function PerekamVideo({ onPakai, onBatal }: PerekamVideoProps) {
  const [tahap, setTahap] = useState<Tahap>("memuat");
  const [sisaDetik, setSisaDetik] = useState(DURASI_MAKS_DETIK);
  const [hasil, setHasil] = useState<{ file: File; url: string } | null>(null);
  const [pesanGagal, setPesanGagal] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let batal = false;

    if (!navigator.mediaDevices?.getUserMedia || !pilihFormat()) {
      Promise.resolve().then(() => {
        setPesanGagal("Perangkat ini belum bisa merekam video dari browser. Gunakan tombol Ambil Foto.");
        setTahap("gagal");
      });
      return;
    }

    bukaKamera()
      .then((stream) => {
        if (batal) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setTahap("siap");
      })
      .catch(() => {
        if (batal) return;
        setPesanGagal("Kamera tidak bisa dibuka. Izinkan akses kamera di browser, lalu coba lagi.");
        setTahap("gagal");
      });

    return () => {
      batal = true;
      if (timerRef.current) clearInterval(timerRef.current);
      if (recorderRef.current?.state === "recording") recorderRef.current.stop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Bebaskan URL pratinjau lama saat diganti atau komponen ditutup
  useEffect(() => {
    return () => {
      if (hasil) URL.revokeObjectURL(hasil.url);
    };
  }, [hasil]);

  function mulaiRekam() {
    const stream = streamRef.current;
    const format = pilihFormat();
    if (!stream || !format) return;

    const potongan: Blob[] = [];
    const recorder = new MediaRecorder(stream, { mimeType: format.mime, videoBitsPerSecond: 1_000_000 });
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) potongan.push(e.data);
    };
    recorder.onstop = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      // Tipe tanpa parameter codecs supaya cocok dengan daftar tipe di bucket
      const tipe = format.mime.split(";")[0];
      const file = new File(potongan, `rekaman.${format.ext}`, { type: tipe });
      setHasil({ file, url: URL.createObjectURL(file) });
      setTahap("selesai");
    };

    recorderRef.current = recorder;
    recorder.start();
    setSisaDetik(DURASI_MAKS_DETIK);
    setTahap("merekam");

    let sisa = DURASI_MAKS_DETIK;
    timerRef.current = setInterval(() => {
      sisa -= 1;
      setSisaDetik(sisa);
      if (sisa <= 0 && recorder.state === "recording") recorder.stop();
    }, 1000);
  }

  function berhentiRekam() {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }

  function rekamUlang() {
    setHasil(null);
    setTahap("siap");
  }

  if (tahap === "gagal") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border bg-muted/30 px-4 py-6 text-center">
        <p className="text-sm text-muted-foreground">{pesanGagal}</p>
        <Button type="button" variant="outline" onClick={onBatal}>
          Kembali
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative overflow-hidden rounded-xl bg-black">
        {/* Kamera langsung, disembunyikan saat memutar hasil rekaman */}
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={tahap === "selesai" ? "hidden" : "aspect-[4/3] w-full -scale-x-100 object-cover"}
        />
        {tahap === "selesai" && hasil && (
          <video src={hasil.url} controls playsInline className="aspect-[4/3] w-full object-contain" />
        )}

        {tahap === "memuat" && (
          <p className="absolute inset-0 flex items-center justify-center text-sm text-white">Membuka kamera...</p>
        )}
        {tahap === "merekam" && (
          <span className="absolute top-3 left-3 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-sm text-white">
            <span className="size-2.5 animate-pulse rounded-full bg-alert" />
            Merekam, sisa {sisaDetik} detik
          </span>
        )}
      </div>

      {tahap === "siap" && (
        <p className="text-sm text-muted-foreground">
          Pastikan wajah dan obat terlihat. Rekaman berhenti otomatis setelah {DURASI_MAKS_DETIK} detik.
        </p>
      )}

      <div className="flex gap-2">
        {tahap === "siap" && (
          <>
            <Button type="button" variant="outline" className="h-12" onClick={onBatal} aria-label="Tutup kamera">
              <X aria-hidden className="size-5" />
            </Button>
            <Button type="button" className="h-12 flex-1 text-base" onClick={mulaiRekam}>
              <Circle aria-hidden className="size-5 fill-current" />
              Mulai rekam
            </Button>
          </>
        )}
        {tahap === "merekam" && (
          <Button type="button" variant="destructive" className="h-12 flex-1 text-base" onClick={berhentiRekam}>
            <Square aria-hidden className="size-5 fill-current" />
            Selesai
          </Button>
        )}
        {tahap === "selesai" && hasil && (
          <>
            <Button type="button" variant="outline" className="h-12 flex-1 text-base" onClick={rekamUlang}>
              <RotateCcw aria-hidden className="size-5" />
              Rekam ulang
            </Button>
            <Button type="button" className="h-12 flex-1 text-base" onClick={() => onPakai(hasil.file)}>
              Pakai video ini
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
