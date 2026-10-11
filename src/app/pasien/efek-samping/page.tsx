import type { Metadata } from "next";
import { getPasienSaya } from "@/lib/auth";
import FormEfekSamping from "../components/form-efek-samping";
import RiwayatEfekSamping from "../components/riwayat-efek-samping";
import KalenderEfekSamping from "../components/kalender-efek-samping";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Lapor Efek Samping",
};

export default async function EfekSampingPage() {
  const { supabase, profil, pasien } = await getPasienSaya();

  if (!pasien) {
    return (
      <main className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <p className="text-muted-foreground">
          Data pengobatan belum tersedia. Hubungi petugas kesehatan.
        </p>
      </main>
    );
  }

  // Ambil semua efek samping pasien
  const { data: efekSampingList } = await supabase
    .from("efek_samping")
    .select("id, jenis, tingkat, catatan, created_at")
    .eq("pasien_id", pasien.id)
    .order("created_at", { ascending: false });

  // Tentukan bulan saat ini di zona waktu WIB
  const now = new Date();
  const bulanWIB = parseInt(
    new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Jakarta", month: "numeric" }).format(now),
    10
  ) - 1;
  const tahunWIB = parseInt(
    new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Jakarta", year: "numeric" }).format(now),
    10
  );

  return (
    <main className="flex-1 bg-muted/20 pb-24">
      <div className="mx-auto max-w-lg px-4 py-6">
        
        {/* Navigation & Header */}
        <div className="mb-6 flex flex-col gap-4">
          <Link
            href="/pasien"
            className="flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Kembali ke Beranda
          </Link>
          
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Lapor Efek Samping</h1>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
              Jika kamu mengalami keluhan setelah minum obat, laporkan di sini agar bisa dipantau oleh petugas kesehatan.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* Form */}
          <Card>
            <CardContent className="pt-6">
              <FormEfekSamping />
            </CardContent>
          </Card>

          {/* Kalender Efek Samping */}
          <Card>
            <CardContent className="pt-6 pb-4">
              <KalenderEfekSamping
                efekSampingList={efekSampingList || []}
                bulan={bulanWIB}
                tahun={tahunWIB}
              />
            </CardContent>
          </Card>

          {/* Riwayat Lengkap */}
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Keluhan</CardTitle>
            </CardHeader>
            <CardContent>
              <RiwayatEfekSamping daftar={efekSampingList || []} />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
