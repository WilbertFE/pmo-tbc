"use client";

import { useEffect, useState } from "react";

type ProgressRingProps = {
  persen: number;
  hariKe: number;
  durasiHari: number;
  tanggalSelesai: string;
  selesai: boolean;
  belumMulai: boolean;
};

// Radius dan ukuran SVG
const RADIUS = 70;
const STROKE_WIDTH = 12;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SIZE = (RADIUS + STROKE_WIDTH) * 2;
const CENTER = SIZE / 2;

export default function ProgressRing({
  persen,
  hariKe,
  durasiHari,
  tanggalSelesai,
  selesai,
  belumMulai,
}: ProgressRingProps) {
  // Animasi: mulai dari 0, lalu naik ke persen sebenarnya
  const [animatedPersen, setAnimatedPersen] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedPersen(persen), 100);
    return () => clearTimeout(timer);
  }, [persen]);

  const offset = CIRCUMFERENCE - (animatedPersen / 100) * CIRCUMFERENCE;

  // Warna ring berdasarkan progress
  const ringColor = selesai
    ? "stroke-emerald-500"
    : persen >= 50
      ? "stroke-sky-500"
      : "stroke-amber-500";

  const bgRingColor = "stroke-muted";

  return (
    <div className="flex flex-col items-center gap-4">
      {/* SVG Ring */}
      <div className="relative">
        <svg width={SIZE} height={SIZE} className="drop-shadow-sm">
          {/* Background ring */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            className={bgRingColor}
            strokeWidth={STROKE_WIDTH}
          />
          {/* Progress ring */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            className={ringColor}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${CENTER} ${CENTER})`}
            style={{ transition: "stroke-dashoffset 1s ease-out" }}
          />
        </svg>
        {/* Teks di tengah ring */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {belumMulai ? (
            <span className="text-sm text-muted-foreground">
              Belum dimulai
            </span>
          ) : selesai ? (
            <>
              <span className="text-2xl">🎉</span>
              <span className="text-sm font-semibold text-emerald-600">
                Selesai!
              </span>
            </>
          ) : (
            <>
              <span className="text-3xl font-bold tracking-tight">
                {animatedPersen}%
              </span>
              <span className="text-xs text-muted-foreground">
                Hari ke-{hariKe}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Info di bawah ring */}
      <div className="text-center space-y-1">
        {!belumMulai && !selesai && (
          <>
            <p className="text-base font-semibold">
              Hari ke-{hariKe} dari {durasiHari}
            </p>
            <p className="text-sm text-muted-foreground">
              Perkiraan selesai:{" "}
              <span className="font-medium text-foreground">
                {tanggalSelesai}
              </span>
            </p>
          </>
        )}
        {selesai && (
          <p className="text-base font-semibold text-emerald-600">
            Pengobatan selesai. Terima kasih sudah konsisten!
          </p>
        )}
        {belumMulai && (
          <p className="text-sm text-muted-foreground">
            Pengobatan belum dimulai.
          </p>
        )}
      </div>
    </div>
  );
}
