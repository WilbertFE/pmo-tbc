"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { tanggalPendek } from "./status-tampilan";

export interface DataKepatuhanHarian {
  tanggal: string;
  jumlahPasien: number;
  jumlahCheckin: number;
  persen: number | null;
}

interface GrafikKepatuhanProps {
  data: DataKepatuhanHarian[];
  isLoading: boolean;
}

// Harus sama dengan h-[220px] pada wadah grafik
const TINGGI = 220;
// kiri 40px dan kanan 12px sama dengan pl-10 dan pr-3 pada label sumbu X
const PAD = { atas: 12, bawah: 8, kiri: 40, kanan: 12 };
const GRID = [0, 50, 100];

// Grafik area satu seri: persentase pasien yang check-in per hari (14 hari terakhir).
// Hover atau tombol panah kiri/kanan menampilkan nilai per hari.
export function GrafikKepatuhan({ data, isLoading }: GrafikKepatuhanProps) {
  const wadahRef = useRef<HTMLDivElement>(null);
  const [lebar, setLebar] = useState(0);
  const [aktif, setAktif] = useState<number | null>(null);

  useEffect(() => {
    const el = wadahRef.current;
    if (!el) return;
    const amati = new ResizeObserver(([entri]) => setLebar(entri.contentRect.width));
    amati.observe(el);
    return () => amati.disconnect();
  }, []);

  const lebarPlot = Math.max(0, lebar - PAD.kiri - PAD.kanan);
  const tinggiPlot = TINGGI - PAD.atas - PAD.bawah;

  const titik = useMemo(
    () =>
      data.map((d, i) => ({
        ...d,
        x: PAD.kiri + (data.length > 1 ? (i / (data.length - 1)) * lebarPlot : lebarPlot / 2),
        y: d.persen === null ? null : PAD.atas + tinggiPlot * (1 - d.persen / 100),
      })),
    [data, lebarPlot, tinggiPlot],
  );

  // Garis putus di hari tanpa pasien aktif (persen null)
  const segmen = useMemo(() => {
    const hasil: (typeof titik)[] = [];
    let kini: typeof titik = [];
    for (const t of titik) {
      if (t.y === null) {
        if (kini.length) hasil.push(kini);
        kini = [];
      } else {
        kini.push(t);
      }
    }
    if (kini.length) hasil.push(kini);
    return hasil;
  }, [titik]);

  const dasarY = PAD.atas + tinggiPlot;
  const adaData = data.some((d) => d.persen !== null);
  const rataRata = adaData
    ? Math.round(
        data.filter((d) => d.persen !== null).reduce((s, d) => s + (d.persen ?? 0), 0) /
          data.filter((d) => d.persen !== null).length,
      )
    : null;

  const pilihDariPointer = (e: PointerEvent<SVGSVGElement>) => {
    if (!titik.length || lebarPlot <= 0) return;
    const kotak = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - kotak.left;
    let terdekat = 0;
    titik.forEach((t, i) => {
      if (Math.abs(t.x - x) < Math.abs(titik[terdekat].x - x)) terdekat = i;
    });
    setAktif(terdekat);
  };

  const geserDenganKeyboard = (e: KeyboardEvent<SVGSVGElement>) => {
    if (!titik.length) return;
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const arah = e.key === "ArrowRight" ? 1 : -1;
      setAktif((i) => Math.min(titik.length - 1, Math.max(0, (i ?? titik.length - 1) + arah)));
    }
  };

  const titikAktif = aktif !== null ? titik[aktif] : null;
  const labelSumbuX = data.length ? [0, Math.floor((data.length - 1) / 2), data.length - 1] : [];

  return (
    <section
      id="grafik-kepatuhan"
      aria-labelledby="judul-kepatuhan"
      className="flex scroll-mt-4 flex-col gap-3 rounded-md border border-black/10 p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 id="judul-kepatuhan" className="text-xl leading-6 font-medium text-foreground">
            Tingkat Kepatuhan Pasien
          </h2>
          <p className="text-base leading-6 text-muted-foreground">Persentase pasien yang check-in setiap hari</p>
        </div>
        {rataRata !== null && (
          <p className="text-right text-xs leading-4 text-muted-foreground">
            Rata-rata 14 hari
            <span className="block text-2xl leading-8 font-medium text-foreground">{rataRata}%</span>
          </p>
        )}
      </div>

      <div ref={wadahRef} className="relative h-[220px] w-full">
        {isLoading && !data.length ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Memuat grafik...</div>
        ) : !adaData ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Belum ada data check-in dalam 14 hari terakhir.
          </div>
        ) : (
          lebar > 0 && (
            <>
              <svg
                width={lebar}
                height={TINGGI}
                role="img"
                aria-label={`Grafik kepatuhan 14 hari terakhir, rata-rata ${rataRata}%. Gunakan panah kiri dan kanan untuk melihat nilai per hari.`}
                tabIndex={0}
                onPointerMove={pilihDariPointer}
                onPointerLeave={() => setAktif(null)}
                onKeyDown={geserDenganKeyboard}
                onBlur={() => setAktif(null)}
                className="touch-none outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <defs>
                  <linearGradient id="isi-kepatuhan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {GRID.map((nilai) => {
                  const y = PAD.atas + tinggiPlot * (1 - nilai / 100);
                  return (
                    <g key={nilai}>
                      <line
                        x1={PAD.kiri}
                        x2={PAD.kiri + lebarPlot}
                        y1={y}
                        y2={y}
                        stroke="var(--border)"
                        strokeDasharray={nilai === 0 ? undefined : "4 4"}
                      />
                      <text
                        x={PAD.kiri - 8}
                        y={y}
                        textAnchor="end"
                        dominantBaseline="middle"
                        className="fill-muted-foreground text-[11px]"
                      >
                        {nilai}%
                      </text>
                    </g>
                  );
                })}

                {segmen.map((s, i) => {
                  const garis = s.map((t, j) => `${j ? "L" : "M"}${t.x},${t.y}`).join(" ");
                  const area = `${garis} L${s[s.length - 1].x},${dasarY} L${s[0].x},${dasarY} Z`;
                  return (
                    <g key={i}>
                      <path d={area} fill="url(#isi-kepatuhan)" />
                      <path
                        d={garis}
                        fill="none"
                        stroke="var(--primary)"
                        strokeWidth={2}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                    </g>
                  );
                })}

                {titikAktif && (
                  <g pointerEvents="none">
                    <line
                      x1={titikAktif.x}
                      x2={titikAktif.x}
                      y1={PAD.atas}
                      y2={dasarY}
                      stroke="var(--muted-foreground)"
                      strokeWidth={1}
                    />
                    {titikAktif.y !== null && (
                      <circle
                        cx={titikAktif.x}
                        cy={titikAktif.y}
                        r={5}
                        fill="var(--primary)"
                        stroke="white"
                        strokeWidth={2}
                      />
                    )}
                  </g>
                )}
              </svg>

              {titikAktif && (
                <div
                  role="status"
                  className="pointer-events-none absolute top-0 rounded-md border bg-white px-3 py-2 text-xs leading-4 shadow-[0px_6px_18px_0px_rgba(0,0,0,0.08)]"
                  style={{
                    // Di samping garis bantu supaya titik data tidak tertutup
                    left: titikAktif.x + 12 + 140 <= lebar ? titikAktif.x + 12 : Math.max(titikAktif.x - 12 - 140, 0),
                    width: 140,
                  }}
                >
                  <p className="text-base leading-5 font-medium text-foreground">
                    {titikAktif.persen === null ? "Tidak ada pasien" : `${titikAktif.persen}%`}
                  </p>
                  {titikAktif.persen !== null && (
                    <p className="text-muted-foreground">
                      {titikAktif.jumlahCheckin} dari {titikAktif.jumlahPasien} pasien
                    </p>
                  )}
                  <p className="text-muted-foreground">{tanggalPendek(titikAktif.tanggal)}</p>
                </div>
              )}
            </>
          )
        )}
      </div>

      {adaData && (
        <div className="flex justify-between pr-3 pl-10 text-xs leading-4 text-muted-foreground">
          {labelSumbuX.map((i) => (
            <span key={i}>{tanggalPendek(data[i].tanggal)}</span>
          ))}
        </div>
      )}

      {/* Versi tabel untuk pembaca layar */}
      <table className="sr-only">
        <caption>Persentase pasien yang check-in per hari</caption>
        <thead>
          <tr>
            <th scope="col">Tanggal</th>
            <th scope="col">Persentase</th>
            <th scope="col">Check-in</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.tanggal}>
              <td>{tanggalPendek(d.tanggal)}</td>
              <td>{d.persen === null ? "-" : `${d.persen}%`}</td>
              <td>
                {d.jumlahCheckin} dari {d.jumlahPasien}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
