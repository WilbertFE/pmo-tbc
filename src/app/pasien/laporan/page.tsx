import type { Metadata } from "next";
import { getPasienSaya } from "@/lib/auth";
import { hitungProgres } from "@/lib/progres";
import { tanggalWIB, tambahHari } from "@/lib/tanggal";
import { Card, CardContent } from "@/components/ui/card";
import FormCheckin from "../components/form-checkin";
import RingkasanPengobatan from "../components/ringkasan-pengobatan";

export const metadata: Metadata = {
  title: "Check-in Harian",
};

export default async function LaporanPage() {
  const { supabase, profil, pasien } = await getPasienSaya();

  // Kalau belum terdaftar sebagai pasien
  if (!pasien) {
    return (
      <main className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <p className="text-muted-foreground">
          Data pengobatan belum tersedia. Hubungi petugas kesehatan untuk
          didaftarkan.
        </p>
      </main>
    );
  }

  const hariIni = tanggalWIB();
  const progres = hitungProgres(pasien.tanggal_mulai, pasien.durasi_hari, hariIni);

  // Ambil semua check-in pasien
  const { data: checkins } = await supabase
    .from("checkin")
    .select("tanggal, status")
    .eq("pasien_id", pasien.id)
    .order("tanggal", { ascending: true });

  // Cek apakah sudah check-in hari ini
  const sudahCheckinHariIni = checkins?.some((c) => c.tanggal === hariIni) ?? false;

  // Hitung streak
  let streak = 0;
  if (checkins && checkins.length > 0) {
    const checkinSet = new Set(checkins.map((c) => c.tanggal));
    let cursor = hariIni;
    if (!checkinSet.has(cursor)) {
      cursor = tambahHari(cursor, -1);
    }
    while (checkinSet.has(cursor)) {
      streak++;
      cursor = tambahHari(cursor, -1);
    }
  }

  // Sisa hari pengobatan
  const sisaHari = progres.durasiHari - progres.hariKe;

  return (
    <main className="flex-1 bg-muted/20">
      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
        {/* Hero Section */}
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          {/* Left: Title */}
          <div className="flex flex-col gap-3">
            <span className="inline-flex w-fit items-center rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
              Check-in
            </span>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Mulai Rutinitas Sehat Kamu
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              Catat minum obat harian kamu di sini. Cukup rekam video singkat
              atau ambil foto sebagai bukti, lalu kirim. Petugas kesehatan akan
              memverifikasinya.
            </p>
          </div>

          {/* Right: Stats Cards */}
          <div className="flex gap-3 sm:gap-4">
            <Card className="min-w-[130px]">
              <CardContent className="flex flex-col items-center gap-1 px-5 py-4 text-center">
                <span className="text-xs font-medium text-muted-foreground">
                  Progress
                </span>
                <span className="text-3xl font-bold tracking-tight">
                  {progres.hariKe}{" "}
                  <span className="text-lg font-semibold text-muted-foreground">
                    Hari
                  </span>
                </span>
                <span className="text-xs text-muted-foreground">
                  -{sisaHari} Hari
                </span>
              </CardContent>
            </Card>

            <Card className="min-w-[130px]">
              <CardContent className="flex flex-col items-center gap-1 px-5 py-4 text-center">
                <span className="text-xs font-medium text-muted-foreground">
                  Streak
                </span>
                <span className="text-3xl font-bold tracking-tight">
                  {streak}{" "}
                  <span className="text-lg font-semibold text-muted-foreground">
                    Hari
                  </span>
                </span>
                <span className="text-xs text-muted-foreground">
                  {sudahCheckinHariIni ? "+1 today" : "Belum hari ini"}
                </span>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Separator */}
        <div className="mb-8 border-t border-border" />

        {/* Main Content: Form + Sidebar */}
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Left: Check-in Form */}
          <div className="flex-1">
            <div className="mb-6">
              <h2 className="text-xl font-bold">Lapor Check-in Hari Ini</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Lengkapi form ini sebagai bukti bahwa kamu telah meminum obat.
              </p>
            </div>

            <FormCheckin
              pasienId={pasien.id}
              tanggalHariIni={hariIni}
              sudahCheckin={sudahCheckinHariIni}
            />
          </div>

          {/* Right: Sidebar */}
          <div className="w-full lg:w-[340px] lg:shrink-0">
            <RingkasanPengobatan
              tanggalMulai={pasien.tanggal_mulai}
              durasiHari={pasien.durasi_hari}
              jamMinum={pasien.jam_minum}
              hariKe={progres.hariKe}
              persen={progres.persen}
              selesai={progres.selesai}
              belumMulai={progres.belumMulai}
            />
          </div>
        </div>
      </div>
    </main>
  );
}