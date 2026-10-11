import type { Metadata } from "next";
import { getPasienSaya } from "@/lib/auth";
import { hitungProgres } from "@/lib/progres";
import { tanggalWIB, tambahHari } from "@/lib/tanggal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProgressRing from "../components/progress-ring";
import KalenderCheckin from "../components/kalender-checkin";
import RiwayatEfekSamping from "../components/riwayat-efek-samping";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Progress Pengobatan",
};

function formatTanggalPanjang(tanggal: string): string {
  const d = new Date(tanggal + "T00:00:00");
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function ProgresPage() {
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
  const tanggalSelesai = tambahHari(pasien.tanggal_mulai, pasien.durasi_hari - 1);

  // Ambil semua check-in pasien
  const { data: checkins } = await supabase
    .from("checkin")
    .select("tanggal, status")
    .eq("pasien_id", pasien.id)
    .order("tanggal", { ascending: true });

  // Ambil efek samping terbaru (5 terakhir)
  const { data: efekSamping } = await supabase
    .from("efek_samping")
    .select("id, jenis, tingkat, catatan, created_at")
    .eq("pasien_id", pasien.id)
    .order("created_at", { ascending: false })
    .limit(5);

  // Tentukan bulan yang ditampilkan (bulan saat ini di WIB)
  const now = new Date();
  const bulanWIB = parseInt(
    new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Jakarta", month: "numeric" }).format(now),
    10,
  ) - 1;
  const tahunWIB = parseInt(
    new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Jakarta", year: "numeric" }).format(now),
    10,
  );


  // Hitung streak (hari berturut-turut check-in terakhir)
  let streak = 0;
  if (checkins && checkins.length > 0) {
    const checkinSet = new Set(checkins.map((c) => c.tanggal));
    let cursor = hariIni;
    // Kalau hari ini belum check-in, mulai dari kemarin
    if (!checkinSet.has(cursor)) {
      cursor = tambahHari(cursor, -1);
    }
    while (checkinSet.has(cursor)) {
      streak++;
      cursor = tambahHari(cursor, -1);
    }
  }

  // Hitung total check-in yang sudah terverifikasi
  const totalCheckin = checkins?.length ?? 0;
  const totalTerverifikasi = checkins?.filter((c) => c.status === "terverifikasi").length ?? 0;

  // Cek apakah sudah check-in hari ini
  const sudahCheckinHariIni = checkins?.some((c) => c.tanggal === hariIni) ?? false;

  // Nama yang ditampilkan
  const namaTampil = profil.peran === "pmo"
    ? (pasien as Record<string, unknown>).profil_pasien
      ? ((pasien as Record<string, unknown>).profil_pasien as { nama: string }).nama
      : profil.nama
    : profil.nama;

  return (
    <main className="flex flex-col gap-4 px-4 py-6 max-w-md mx-auto pb-24">
      {/* Sapaan */}
      <div>
        <h1 className="text-xl font-bold">
          Hai, {namaTampil}! 👋
        </h1>
        <p className="text-sm text-muted-foreground">
          {profil.peran === "pmo" ? "Progress pengobatan pasien yang kamu dampingi." : "Ini adalah progress pengobatanmu."}
        </p>
      </div>

      {/* Progress Ring */}
      <Card>
        <CardContent className="pt-6">
          <ProgressRing
            persen={progres.persen}
            hariKe={progres.hariKe}
            durasiHari={progres.durasiHari}
            tanggalSelesai={formatTanggalPanjang(tanggalSelesai)}
            selesai={progres.selesai}
            belumMulai={progres.belumMulai}
          />
        </CardContent>
      </Card>

      {/* Status Hari Ini + Statistik Singkat */}
      <div className="grid grid-cols-2 gap-3">
        <Card size="sm">
          <CardContent>
            <div className="flex flex-col items-center text-center gap-1">
              <span className="text-2xl">{sudahCheckinHariIni ? "✅" : "⏳"}</span>
              <span className="text-xs text-muted-foreground">Hari ini</span>
              <span className="text-sm font-semibold">
                {sudahCheckinHariIni ? "Sudah check-in" : "Belum check-in"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardContent>
            <div className="flex flex-col items-center text-center gap-1">
              <span className="text-2xl">🔥</span>
              <span className="text-xs text-muted-foreground">Streak</span>
              <span className="text-sm font-semibold">
                {streak > 0 ? `${streak} hari berturut` : "Belum ada"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Pengobatan */}
      <Card size="sm">
        <CardContent>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-lg font-bold">{totalCheckin}</p>
              <p className="text-xs text-muted-foreground">Total check-in</p>
            </div>
            <div>
              <p className="text-lg font-bold">{totalTerverifikasi}</p>
              <p className="text-xs text-muted-foreground">Terverifikasi</p>
            </div>
            <div>
              <p className="text-lg font-bold">
                {progres.durasiHari - progres.hariKe}
              </p>
              <p className="text-xs text-muted-foreground">Hari tersisa</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kalender Check-in */}
      <Card>
        <CardHeader>
          <CardTitle>Kalender Check-in</CardTitle>
        </CardHeader>
        <CardContent>
          <KalenderCheckin
            checkins={checkins ?? []}
            tanggalMulai={pasien.tanggal_mulai}
            durasiHari={pasien.durasi_hari}
            tanggalHariIni={hariIni}
            bulan={bulanWIB}
            tahun={tahunWIB}
          />
        </CardContent>
      </Card>


      {/* Riwayat Efek Samping Terakhir */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Efek Samping Terakhir</CardTitle>
          <Link
            href="/pasien/laporan"
            className="text-xs text-primary hover:underline"
          >
            Lapor baru
          </Link>
        </CardHeader>
        <CardContent>
          <RiwayatEfekSamping daftar={efekSamping ?? []} />
        </CardContent>
      </Card>

      {/* Info Detail Pengobatan */}
      <Card size="sm">
        <CardHeader>
          <CardTitle className="text-sm">Detail Pengobatan</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Mulai pengobatan</dt>
              <dd className="font-medium">{formatTanggalPanjang(pasien.tanggal_mulai)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Durasi pengobatan</dt>
              <dd className="font-medium">{pasien.durasi_hari} hari</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Jam minum obat</dt>
              <dd className="font-medium">{pasien.jam_minum.slice(0, 5)} WIB</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Perkiraan selesai</dt>
              <dd className="font-medium">{formatTanggalPanjang(tanggalSelesai)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </main>
  );
}
