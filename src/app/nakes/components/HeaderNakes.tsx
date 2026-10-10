"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, AlertTriangle, AlertCircle, CheckCircle2, RotateCw, LogOut, UserPlus } from "lucide-react";
import type { RingkasanDashboard } from "./types";

interface HeaderNakesProps {
  namaNakes: string;
  ringkasan: RingkasanDashboard;
  onRefresh: () => void;
  isLoading: boolean;
  filterAktif: string;
  onPilihFilter: (filter: string) => void;
  onTambahPasien: () => void;
}

export function HeaderNakes({
  namaNakes,
  ringkasan,
  onRefresh,
  isLoading,
  filterAktif,
  onPilihFilter,
  onTambahPasien,
}: HeaderNakesProps) {
  return (
    <header className="space-y-4">
      {/* Baris Atas: Profil & Aksi */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
              Petugas Nakes
            </span>
            <span className="text-xs text-muted-foreground">Puskesmas Pemantau</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mt-1">
            Dashboard Pemantauan Pasien
          </h1>
          <p className="text-sm text-muted-foreground">
            Selamat bertugas, <span className="font-medium text-foreground">{namaNakes}</span>. Pantau kepatuhan minum obat secara real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" onClick={onTambahPasien} className="flex items-center gap-1.5">
            <UserPlus className="size-4" />
            Tambah Pasien
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5"
          >
            <RotateCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
            Perbarui Data
          </Button>
          <form action="/api/auth/logout" method="post">
            <Button variant="ghost" size="sm" type="submit" className="text-muted-foreground hover:text-destructive">
              <LogOut className="size-4 mr-1" />
              Keluar
            </Button>
          </form>
        </div>
      </div>

      {/* Baris Metrik / Ringkasan Prioritas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Total Pasien */}
        <Card
          size="sm"
          onClick={() => onPilihFilter("semua")}
          className={`cursor-pointer transition hover:border-primary/50 ${
            filterAktif === "semua" ? "ring-2 ring-primary" : ""
          }`}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Pasien</p>
              <h2 className="text-2xl font-bold mt-0.5">{ringkasan.total}</h2>
              <span className="text-[11px] text-muted-foreground">Dalam pendampingan</span>
            </div>
            <div className="p-2.5 rounded-xl bg-muted text-muted-foreground">
              <Users className="size-5" />
            </div>
          </CardContent>
        </Card>

        {/* Perlu Perhatian Segera (Merah) */}
        <Card
          size="sm"
          onClick={() => onPilihFilter("merah")}
          className={`cursor-pointer transition hover:border-red-500/50 ${
            filterAktif === "merah" ? "ring-2 ring-red-600 bg-red-500/5" : ""
          }`}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-red-600 animate-pulse" />
                <p className="text-xs text-red-600 dark:text-red-400 font-semibold">Perhatian Segera</p>
              </div>
              <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mt-0.5">
                {ringkasan.merah}
              </h2>
              <span className="text-[11px] text-red-600/80 dark:text-red-400/80 font-medium">
                Prioritas tertinggi
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
              <AlertCircle className="size-5" />
            </div>
          </CardContent>
        </Card>

        {/* Perlu Pemantauan (Kuning) */}
        <Card
          size="sm"
          onClick={() => onPilihFilter("kuning")}
          className={`cursor-pointer transition hover:border-amber-500/50 ${
            filterAktif === "kuning" ? "ring-2 ring-amber-500 bg-amber-500/5" : ""
          }`}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">Perlu Pemantauan</p>
              <h2 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                {ringkasan.kuning}
              </h2>
              <span className="text-[11px] text-amber-600/80 dark:text-amber-400/80 font-medium">
                Terlambat / ada keluhan
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="size-5" />
            </div>
          </CardContent>
        </Card>

        {/* Terkendali (Hijau) */}
        <Card
          size="sm"
          onClick={() => onPilihFilter("hijau")}
          className={`cursor-pointer transition hover:border-emerald-500/50 ${
            filterAktif === "hijau" ? "ring-2 ring-emerald-600 bg-emerald-500/5" : ""
          }`}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Terkendali</p>
              <h2 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {ringkasan.hijau}
              </h2>
              <span className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 font-medium">
                Sesuai jadwal
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>
    </header>
  );
}
