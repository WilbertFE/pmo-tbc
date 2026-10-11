"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { BarAtasNakes, HeaderNakes } from "./HeaderNakes";
import { SidebarNakes } from "./SidebarNakes";
import { FilterPasien, gayaTombolSekunder } from "./FilterPasien";
import { TabelPasienNakes } from "./TabelPasienNakes";
import { PanelDetailPasien } from "./PanelDetailPasien";
import { GrafikKepatuhan, type DataKepatuhanHarian } from "./GrafikKepatuhan";
import { ModalVerifikasi, type CheckinDitinjau } from "./ModalVerifikasi";
import { NotifikasiNakes, type Notifikasi } from "./NotifikasiNakes";
import { ModalTindakLanjut } from "./ModalTindakLanjut";
import { ModalTambahPasien } from "./ModalTambahPasien";
import type { PasienNakes, RingkasanDashboard } from "./types";
import { AlertCircle, RotateCw } from "lucide-react";

// Bandingkan data lama dan baru untuk notifikasi eskalasi
function cariPerubahan(lama: PasienNakes[], baru: PasienNakes[]): Omit<Notifikasi, "id">[] {
  const petaLama = new Map(lama.map((p) => [p.id, p]));
  const hasil: Omit<Notifikasi, "id">[] = [];
  for (const p of baru) {
    const sebelum = petaLama.get(p.id);
    if (!sebelum) continue;
    if (p.status === "merah" && sebelum.status !== "merah") {
      hasil.push({
        jenis: "darurat",
        judul: `${p.nama} perlu perhatian segera`,
        // Tampilkan alasan penyebab merah, bukan sekadar alasan pertama
        isi:
          p.alasanStatus.find((a) => a.includes("berat") || a.includes("2 hari")) ??
          p.alasanStatus[0] ??
          "Status berubah menjadi merah",
        pasienId: p.id,
      });
    }
    if (p.checkinHariIni && p.checkinHariIni.id !== sebelum.checkinHariIni?.id) {
      hasil.push({
        jenis: "checkin",
        judul: `Check-in baru dari ${p.nama}`,
        isi: "Bukti minum obat menunggu verifikasi",
        pasienId: p.id,
      });
    }
  }
  return hasil;
}

// Pasien yang punya check-in belum diverifikasi dalam 7 hari terakhir
const adaMenunggu = (p: PasienNakes) => p.riwayatCheckin.some((c) => c.status === "menunggu");

const RINGKASAN_KOSONG: RingkasanDashboard = { total: 0, merah: 0, kuning: 0, hijau: 0 };

async function ambilDataPasien() {
  const res = await fetch("/api/nakes/pasien");
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Gagal memuat data pasien");
  return data as {
    pasien: PasienNakes[];
    ringkasan: RingkasanDashboard;
    nakes?: { nama?: string };
  };
}

async function ambilDataKepatuhan() {
  const res = await fetch("/api/nakes/kepatuhan");
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Gagal memuat data kepatuhan");
  return (data.harian ?? []) as DataKepatuhanHarian[];
}

export function DashboardNakesClient() {
  const [daftarPasien, setDaftarPasien] = useState<PasienNakes[]>([]);
  const [ringkasan, setRingkasan] = useState<RingkasanDashboard>(RINGKASAN_KOSONG);
  const [kepatuhan, setKepatuhan] = useState<DataKepatuhanHarian[]>([]);
  const [namaNakes, setNamaNakes] = useState<string>("Petugas Nakes");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorPesan, setErrorPesan] = useState<string | null>(null);

  // Filter, pencarian, pilihan baris, dan paginasi
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("semua");
  const [hanyaMenunggu, setHanyaMenunggu] = useState(false);
  const [pasienTerpilihId, setPasienTerpilihId] = useState<string | null>(null);
  const [halaman, setHalaman] = useState(1);
  const [barisPerHalaman, setBarisPerHalaman] = useState(5);

  // Modal
  const [verifikasi, setVerifikasi] = useState<{ pasien: PasienNakes; checkin: CheckinDitinjau } | null>(null);
  const [notifikasi, setNotifikasi] = useState<Notifikasi[]>([]);
  const dataSebelumnya = useRef<PasienNakes[] | null>(null);
  const idNotifikasi = useRef(0);
  const [pasienTindakLanjut, setPasienTindakLanjut] = useState<PasienNakes | null>(null);
  const [tambahPasienTerbuka, setTambahPasienTerbuka] = useState(false);

  const tutupNotifikasi = useCallback((id: number) => {
    setNotifikasi((daftar) => daftar.filter((n) => n.id !== id));
  }, []);

  const terapkanData = useCallback((data: Awaited<ReturnType<typeof ambilDataPasien>>) => {
    const baru = data.pasien || [];
    // Notifikasi hanya untuk perubahan setelah data awal dimuat
    if (dataSebelumnya.current) {
      const perubahan = cariPerubahan(dataSebelumnya.current, baru).map((n) => ({
        ...n,
        id: ++idNotifikasi.current,
      }));
      if (perubahan.length) {
        setNotifikasi((daftar) => [...daftar, ...perubahan].slice(-4));
        perubahan.forEach((n) => setTimeout(() => tutupNotifikasi(n.id), 8000));
      }
    }
    dataSebelumnya.current = baru;
    setDaftarPasien(baru);
    setRingkasan(data.ringkasan || RINGKASAN_KOSONG);
    if (data.nakes?.nama) setNamaNakes(data.nakes.nama);
  }, [tutupNotifikasi]);

  // Muat ulang data untuk tombol Perbarui dan event realtime
  const muatData = useCallback(async () => {
    setIsLoading(true);
    setErrorPesan(null);
    try {
      const [dataPasien, dataKepatuhan] = await Promise.all([ambilDataPasien(), ambilDataKepatuhan()]);
      terapkanData(dataPasien);
      setKepatuhan(dataKepatuhan);
    } catch (err: unknown) {
      setErrorPesan(err instanceof Error ? err.message : "Terjadi kesalahan koneksi");
    } finally {
      setIsLoading(false);
    }
  }, [terapkanData]);

  // Data awal saat halaman dibuka
  useEffect(() => {
    let dibatalkan = false;

    Promise.all([ambilDataPasien(), ambilDataKepatuhan()])
      .then(([dataPasien, dataKepatuhan]) => {
        if (dibatalkan) return;
        terapkanData(dataPasien);
        setKepatuhan(dataKepatuhan);
      })
      .catch((err: unknown) => {
        if (!dibatalkan) setErrorPesan(err instanceof Error ? err.message : "Terjadi kesalahan koneksi");
      })
      .finally(() => {
        if (!dibatalkan) setIsLoading(false);
      });

    return () => {
      dibatalkan = true;
    };
  }, [terapkanData]);

  // Langganan Supabase Realtime (AGENTS.md bagian 6, pengecualian 2)
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("nakes-dashboard-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "checkin" }, () => {
        muatData();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "efek_samping" }, () => {
        muatData();
      })
      .subscribe();

    // Wajib: bersihkan channel saat unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [muatData]);

  const jumlahMenunggu = useMemo(() => daftarPasien.filter(adaMenunggu).length, [daftarPasien]);

  // Data sudah diurutkan API: merah paling atas, lalu kuning, lalu hijau
  const pasienTerfilter = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return daftarPasien.filter((pasien) => {
      if (filterStatus !== "semua" && pasien.status !== filterStatus) return false;
      if (hanyaMenunggu && !adaMenunggu(pasien)) return false;
      if (query && !pasien.nama.toLowerCase().includes(query) && !pasien.namaPmo.toLowerCase().includes(query)) {
        return false;
      }
      return true;
    });
  }, [daftarPasien, filterStatus, hanyaMenunggu, searchQuery]);

  // Pasien terpilih tetap sama setelah data diperbarui. Kalau hilang dari filter, pilih baris teratas.
  const pasienTerpilih =
    pasienTerfilter.find((p) => p.id === pasienTerpilihId) ?? pasienTerfilter[0] ?? null;

  const gantiPencarian = (query: string) => {
    setSearchQuery(query);
    setHalaman(1);
  };
  const gantiFilter = (status: string) => {
    setFilterStatus(status);
    setHalaman(1);
  };

  return (
    <div className="min-h-svh bg-[#fafafa]">
      <div className="mx-auto flex max-w-[1440px] gap-4 p-4">
        <SidebarNakes
          namaNakes={namaNakes}
          searchQuery={searchQuery}
          onSearchChange={gantiPencarian}
          onTambahPasien={() => setTambahPasienTerbuka(true)}
          onRefresh={muatData}
          isLoading={isLoading}
        />

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <BarAtasNakes />

          <main className="flex flex-col gap-5 rounded-sm bg-white p-5 drop-shadow-[0px_4px_3px_rgba(0,0,0,0.06)]">
            <HeaderNakes ringkasan={ringkasan} filterAktif={filterStatus} onPilihFilter={gantiFilter} />

            {errorPesan && (
              <div
                role="alert"
                className="flex items-center justify-between gap-3 rounded-md border border-alert/30 bg-alert-subtle p-3 text-sm text-[#b3261e]"
              >
                <span className="flex items-center gap-2">
                  <AlertCircle aria-hidden className="size-5 shrink-0" />
                  {errorPesan}
                </span>
                <button type="button" onClick={muatData} className={gayaTombolSekunder}>
                  Coba Lagi
                </button>
              </div>
            )}

            <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_285px]">
              <div id="daftar-pasien" className="flex min-w-0 scroll-mt-4 flex-col gap-5">
                <FilterPasien
                  searchQuery={searchQuery}
                  onSearchChange={gantiPencarian}
                  hanyaMenunggu={hanyaMenunggu}
                  onToggleMenunggu={() => {
                    setHanyaMenunggu((v) => !v);
                    setHalaman(1);
                  }}
                  jumlahMenunggu={jumlahMenunggu}
                  onRefresh={muatData}
                  isLoading={isLoading}
                  onTambahPasien={() => setTambahPasienTerbuka(true)}
                />

                {isLoading && daftarPasien.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 rounded-md border border-[#d4d4d8] px-6 py-16 text-center">
                    <RotateCw aria-hidden className="size-7 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Memuat data pasien...</p>
                  </div>
                ) : (
                  <TabelPasienNakes
                    daftarPasien={pasienTerfilter}
                    pasienTerpilihId={pasienTerpilih?.id ?? null}
                    onPilihPasien={(p) => setPasienTerpilihId(p.id)}
                    halaman={halaman}
                    barisPerHalaman={barisPerHalaman}
                    onGantiHalaman={setHalaman}
                    onGantiBarisPerHalaman={(n) => {
                      setBarisPerHalaman(n);
                      setHalaman(1);
                    }}
                  />
                )}

                {/* Di layar kecil, panel detail tampil di bawah tabel */}
                <div className="xl:hidden">
                  <PanelDetailPasien
                    pasien={pasienTerpilih}
                    onBukaVerifikasi={(pasien, checkin) => setVerifikasi({ pasien, checkin })}
                    onBukaTindakLanjut={setPasienTindakLanjut}
                  />
                </div>

                <GrafikKepatuhan data={kepatuhan} isLoading={isLoading} />
              </div>

              <div className="sticky top-4 hidden xl:block">
                <PanelDetailPasien
                  pasien={pasienTerpilih}
                  onBukaVerifikasi={(pasien, checkin) => setVerifikasi({ pasien, checkin })}
                  onBukaTindakLanjut={setPasienTindakLanjut}
                />
              </div>
            </div>
          </main>
        </div>
      </div>

      {verifikasi && (
        <ModalVerifikasi
          key={verifikasi.checkin.id}
          pasien={verifikasi.pasien}
          checkin={verifikasi.checkin}
          onClose={() => setVerifikasi(null)}
          onSuksesVerifikasi={muatData}
        />
      )}

      <NotifikasiNakes
        daftar={notifikasi}
        onTutup={tutupNotifikasi}
        onBuka={(n) => {
          setFilterStatus("semua");
          setHanyaMenunggu(false);
          setSearchQuery("");
          setPasienTerpilihId(n.pasienId);
          const indeks = daftarPasien.findIndex((p) => p.id === n.pasienId);
          setHalaman(indeks >= 0 ? Math.floor(indeks / barisPerHalaman) + 1 : 1);
          tutupNotifikasi(n.id);
        }}
      />

      {tambahPasienTerbuka && (
        <ModalTambahPasien onClose={() => setTambahPasienTerbuka(false)} onSuksesTambah={muatData} />
      )}

      {pasienTindakLanjut && (
        <ModalTindakLanjut
          pasien={pasienTindakLanjut}
          onClose={() => setPasienTindakLanjut(null)}
          onSuksesSimpan={muatData}
        />
      )}
    </div>
  );
}
