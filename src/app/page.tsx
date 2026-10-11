import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { halamanUtama } from "@/lib/peran";
import { NavbarLanding } from "./_landing/navbar";
import {
  AlasanLanding,
  CaraKerjaLanding,
  FooterLanding,
  HeroLanding,
  TentangLanding,
} from "./_landing/sections";

// Judul dan deskripsi publik harus netral: jangan sebut "TBC" atau "tuberkulosis"
export const metadata: Metadata = {
  title: { absolute: "Pendamping Minum Obat" },
  description:
    "Catat minum obat setiap hari, laporkan efek samping, dan tetap terhubung dengan petugas puskesmas.",
};

// Halaman aplikasi sesuai peran untuk tombol "Buka Aplikasi", null kalau belum login
async function getTujuanAplikasi(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) return null;

  const { data: profil } = await supabase.from("profiles").select("peran").eq("id", userId).single();
  return profil ? halamanUtama(profil.peran) : null;
}

export default async function Home() {
  const tujuanAplikasi = await getTujuanAplikasi();

  return (
    <div className="flex min-h-svh flex-col bg-white">
      <NavbarLanding tujuanAplikasi={tujuanAplikasi} />
      <main className="flex-1">
        <HeroLanding tujuanAplikasi={tujuanAplikasi} />
        <TentangLanding tujuanAplikasi={tujuanAplikasi} />
        <CaraKerjaLanding tujuanAplikasi={tujuanAplikasi} />
        <AlasanLanding />
      </main>
      <FooterLanding />
    </div>
  );
}
