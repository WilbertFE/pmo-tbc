import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck, CircleAlert, CircleCheck, Clock, Stethoscope, TrendingUp } from "lucide-react";
import { getPasienSaya } from "@/lib/auth";
import { hitungProgres } from "@/lib/progres";
import { jamWIB, tanggalWIB } from "@/lib/tanggal";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Beranda",
};

type StatusHariIni = "belum" | "menunggu" | "terverifikasi" | "ditolak";

const TAMPILAN_STATUS: Record<
  StatusHariIni,
  { judul: string; keterangan: string; ikon: typeof Clock; warna: string }
> = {
  belum: {
    judul: "Belum check-in hari ini",
    keterangan: "Minum obat, lalu kirim video atau foto sebagai bukti.",
    ikon: Clock,
    warna: "bg-warning-subtle text-warning",
  },
  menunggu: {
    judul: "Check-in terkirim",
    keterangan: "Petugas sedang memeriksa bukti Anda. Terima kasih!",
    ikon: CircleCheck,
    warna: "bg-info-subtle text-info",
  },
  terverifikasi: {
    judul: "Check-in sudah diperiksa",
    keterangan: "Bukti Anda sudah diterima petugas. Sampai jumpa besok!",
    ikon: CircleCheck,
    warna: "bg-success-subtle text-success",
  },
  ditolak: {
    judul: "Bukti perlu dikirim ulang",
    keterangan: "Video atau foto belum jelas. Silakan check-in sekali lagi.",
    ikon: CircleAlert,
    warna: "bg-alert-subtle text-alert",
  },
};

// Beranda pasien/PMO: status hari ini dan satu tombol utama untuk check-in
export default async function BerandaPasienPage() {
  const { supabase, profil, pasien } = await getPasienSaya();

  if (!pasien) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <p className="text-muted-foreground">
          Data pengobatan belum tersedia. Hubungi petugas kesehatan untuk didaftarkan.
        </p>
      </main>
    );
  }

  const hariIni = tanggalWIB();
  const progres = hitungProgres(pasien.tanggal_mulai, pasien.durasi_hari, hariIni);

  const { data: checkinHariIni } = await supabase
    .from("checkin")
    .select("status")
    .eq("pasien_id", pasien.id)
    .eq("tanggal", hariIni)
    .maybeSingle();

  const status: StatusHariIni = checkinHariIni?.status ?? "belum";
  const tampilan = TAMPILAN_STATUS[status];
  const IkonStatus = tampilan.ikon;
  const perluCheckin = (status === "belum" || status === "ditolak") && !progres.belumMulai && !progres.selesai;

  const jamMinum = pasien.jam_minum.slice(0, 5);
  const lewatJamMinum = jamWIB() >= jamMinum;

  const profilPasien = pasien.profil_pasien as { nama: string } | null;
  const namaPasien = profilPasien?.nama ?? profil.nama;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 py-6">
      <div>
        <h1 className="text-2xl font-semibold">Halo, {profil.nama}</h1>
        <p className="text-muted-foreground">
          {profil.peran === "pmo" ? `Anda mendampingi ${namaPasien}.` : "Semoga sehat selalu hari ini."}
        </p>
      </div>

      {/* Status hari ini */}
      <section className="flex flex-col gap-4 rounded-xl border bg-background p-5">
        <div className="flex items-start gap-3">
          <span className={cn("flex size-12 shrink-0 items-center justify-center rounded-full", tampilan.warna)}>
            <IkonStatus aria-hidden className="size-6" />
          </span>
          <div>
            <h2 className="text-lg font-semibold">{tampilan.judul}</h2>
            <p className="text-muted-foreground">{tampilan.keterangan}</p>
          </div>
        </div>

        {perluCheckin && (
          <>
            <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
              Jadwal minum obat: <span className="font-medium text-foreground">{jamMinum} WIB</span>
              {status === "belum" && lewatJamMinum && " (sudah lewat, segera minum obat ya)"}
            </p>
            <Link href="/pasien/laporan" className={buttonVariants({ className: "h-14 w-full text-lg" })}>
              <CalendarCheck aria-hidden className="size-6" />
              {status === "ditolak" ? "Check-in ulang" : "Check-in sekarang"}
            </Link>
          </>
        )}
      </section>

      {/* Progres singkat */}
      <Link
        href="/pasien/progress"
        className="flex items-center gap-4 rounded-xl border bg-background p-5 transition hover:bg-muted/50"
      >
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-50 text-primary">
          <TrendingUp aria-hidden className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          {progres.belumMulai ? (
            <p className="text-lg font-semibold">Pengobatan belum dimulai</p>
          ) : progres.selesai ? (
            <p className="text-lg font-semibold">Pengobatan selesai</p>
          ) : (
            <p className="text-lg font-semibold">
              Hari ke-{progres.hariKe} dari {progres.durasiHari}
            </p>
          )}
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${progres.persen}%` }} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Lihat kalender dan riwayat</p>
        </div>
      </Link>

      {/* Lapor keluhan */}
      <Link
        href="/pasien/efek-samping"
        className="flex items-center gap-4 rounded-xl border bg-background p-5 transition hover:bg-muted/50"
      >
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
          <Stethoscope aria-hidden className="size-6" />
        </span>
        <div>
          <p className="text-lg font-semibold">Ada keluhan setelah minum obat?</p>
          <p className="text-sm text-muted-foreground">Laporkan ke petugas kesehatan</p>
        </div>
      </Link>
    </main>
  );
}
