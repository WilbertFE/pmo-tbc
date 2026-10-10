"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { HeaderNakes } from "./HeaderNakes";
import { FilterPasien } from "./FilterPasien";
import { TabelPasienNakes } from "./TabelPasienNakes";
import { ModalVerifikasi } from "./ModalVerifikasi";
import { ModalTindakLanjut } from "./ModalTindakLanjut";
import type { PasienNakes, RingkasanDashboard } from "./types";
import { AlertCircle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardNakesClient() {
  const [daftarPasien, setDaftarPasien] = useState<PasienNakes[]>([]);
  const [ringkasan, setRingkasan] = useState<RingkasanDashboard>({
    total: 0,
    merah: 0,
    kuning: 0,
    hijau: 0,
  });
  const [namaNakes, setNamaNakes] = useState<string>("Petugas Nakes");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorPesan, setErrorPesan] = useState<string | null>(null);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("semua");

  // Modal State
  const [pasienVerifikasi, setPasienVerifikasi] = useState<PasienNakes | null>(null);
  const [pasienTindakLanjut, setPasienTindakLanjut] = useState<PasienNakes | null>(null);

  // Fungsi Fetch Data Pasien untuk tombol refresh dan realtime
  const muatData = useCallback(async () => {
    setIsLoading(true);
    setErrorPesan(null);
    try {
      const res = await fetch("/api/nakes/pasien");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal memuat data pasien");
      }

      setDaftarPasien(data.pasien || []);
      setRingkasan(data.ringkasan || { total: 0, merah: 0, kuning: 0, hijau: 0 });
      if (data.nakes?.nama) {
        setNamaNakes(data.nakes.nama);
      }
    } catch (err: unknown) {
      setErrorPesan(err instanceof Error ? err.message : "Terjadi kesalahan koneksi");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Inisialisasi data awal saat komponen dimuat
  useEffect(() => {
    let dibatalkan = false;

    const inisialisasiData = async () => {
      try {
        const res = await fetch("/api/nakes/pasien");
        const data = await res.json();

        if (dibatalkan) return;

        if (!res.ok) {
          setErrorPesan(data.error || "Gagal memuat data pasien");
        } else {
          setDaftarPasien(data.pasien || []);
          setRingkasan(data.ringkasan || { total: 0, merah: 0, kuning: 0, hijau: 0 });
          if (data.nakes?.nama) {
            setNamaNakes(data.nakes.nama);
          }
        }
      } catch (err: unknown) {
        if (!dibatalkan) {
          setErrorPesan(err instanceof Error ? err.message : "Terjadi kesalahan koneksi");
        }
      } finally {
        if (!dibatalkan) {
          setIsLoading(false);
        }
      }
    };

    inisialisasiData();

    return () => {
      dibatalkan = true;
    };
  }, []);

  // Langganan Supabase Realtime (Exception 2 AGENTS.md)
  useEffect(() => {
    const supabase = createClient();

    // Dengarkan perubahan pada tabel checkin dan efek_samping
    const channel = supabase
      .channel("nakes-dashboard-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "checkin" },
        () => {
          // Refresh data otomatis ketika ada check-in baru atau pembaruan status
          muatData();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "efek_samping" },
        () => {
          // Refresh data otomatis ketika ada laporan efek samping baru
          muatData();
        },
      )
      .subscribe();

    // Wajib: bersihkan channel saat unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [muatData]);

  // Filter & Pencarian Pasien
  const pasienTerfilter = useMemo(() => {
    return daftarPasien.filter((pasien) => {
      // Filter Status
      if (filterStatus === "merah" && pasien.status !== "merah") return false;
      if (filterStatus === "kuning" && pasien.status !== "kuning") return false;
      if (filterStatus === "hijau" && pasien.status !== "hijau") return false;
      if (filterStatus === "menunggu") {
        if (!pasien.checkinHariIni || pasien.checkinHariIni.status !== "menunggu") {
          return false;
        }
      }

      // Filter Pencarian
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const namaCocok = pasien.nama.toLowerCase().includes(query);
        const pmoCocok = pasien.namaPmo.toLowerCase().includes(query);
        if (!namaCocok && !pmoCocok) return false;
      }

      return true;
    });
  }, [daftarPasien, filterStatus, searchQuery]);

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        {/* Header & Ringkasan Metrik */}
        <HeaderNakes
          namaNakes={namaNakes}
          ringkasan={ringkasan}
          onRefresh={muatData}
          isLoading={isLoading}
          filterAktif={filterStatus}
          onPilihFilter={setFilterStatus}
        />

        {/* Notifikasi Error jika ada */}
        {errorPesan && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="size-5 shrink-0" />
              <span>{errorPesan}</span>
            </div>
            <Button variant="outline" size="xs" onClick={muatData}>
              Coba Lagi
            </Button>
          </div>
        )}

        {/* Kontrol Filter dan Pencarian */}
        <FilterPasien
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterStatus={filterStatus}
          onFilterChange={setFilterStatus}
          jumlahPasienFiltered={pasienTerfilter.length}
        />

        {/* Konten Utama: Tabel Pasien Information-dense */}
        {isLoading && daftarPasien.length === 0 ? (
          <div className="p-16 text-center border rounded-2xl bg-background">
            <RotateCw className="size-8 animate-spin mx-auto text-primary mb-3" />
            <p className="text-sm font-medium">Memuat data pasien nakes...</p>
            <p className="text-xs text-muted-foreground mt-1">
              Menghitung status kepatuhan dan early warning
            </p>
          </div>
        ) : (
          <TabelPasienNakes
            daftarPasien={pasienTerfilter}
            onBukaVerifikasi={(pasien) => setPasienVerifikasi(pasien)}
            onBukaTindakLanjut={(pasien) => setPasienTindakLanjut(pasien)}
          />
        )}
      </div>

      {/* Modal Dialog Verifikasi */}
      {pasienVerifikasi && (
        <ModalVerifikasi
          pasien={pasienVerifikasi}
          onClose={() => setPasienVerifikasi(null)}
          onSuksesVerifikasi={muatData}
        />
      )}

      {/* Modal Dialog Tindak Lanjut */}
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
