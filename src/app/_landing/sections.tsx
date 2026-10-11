import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  CircleCheck,
  ShieldCheck,
  SquareArrowRight,
} from "lucide-react";
import { LogoAplikasi } from "./navbar";

// Bagian-bagian landing page sesuai Figma "Landing Page - xl" (lihat docs/design/README.md)

const wadah = "mx-auto w-full max-w-[1212px] px-6";

function Tag({ children, terang = false }: { children: ReactNode; terang?: boolean }) {
  return (
    <span
      className={
        terang
          ? "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm leading-5 whitespace-nowrap text-[#fafafa] sm:text-base"
          : "inline-flex w-fit rounded-md bg-brand-50 px-[18px] py-2.5 text-base leading-5 text-brand-700"
      }
    >
      {children}
    </span>
  );
}

function TombolUtama({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 w-fit items-center justify-center gap-3 rounded-md border border-primary bg-primary px-5 py-2 text-lg leading-[22px] font-medium text-[#fafafa] transition hover:bg-brand-600 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      {children}
      <ArrowRight aria-hidden className="size-5" />
    </Link>
  );
}

// 1. Hero
export function HeroLanding({ tujuanAplikasi }: { tujuanAplikasi: string | null }) {
  return (
    <section id="beranda" className="scroll-mt-[74px] p-3 sm:p-6">
      <div className="relative isolate flex min-h-[460px] flex-col items-center justify-center overflow-hidden rounded-[20px] px-6 py-16 text-center sm:min-h-[508px] sm:p-24">
        <Image
          src="/images/auth-masuk.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-[50%_30%]"
        />
        <div aria-hidden className="absolute inset-0 -z-10 bg-black/45" />

        <div className="flex max-w-[1092px] flex-col items-center gap-10">
          <div className="flex flex-col items-center gap-3">
            <Tag terang>
              <ShieldCheck aria-hidden className="size-5 shrink-0 sm:size-6" />
              Teman Setia Selama Pengobatan
            </Tag>
            <h1 className="text-[34px] leading-[42px] font-medium text-[#fafafa] sm:text-[52px] sm:leading-[60px]">
              Pantau Rutinitas Minum Obat Anda Setiap Hari dengan Mudah
            </h1>
            <p className="max-w-[754px] text-base leading-[22px] text-[#fafafa] sm:text-lg">
              Rekam proses minum obat Anda, laporkan efek samping yang dirasakan, dan tetap terhubung dengan petugas
              puskesmas setiap hari.
            </p>
          </div>

          <Link
            href={tujuanAplikasi ?? "/daftar"}
            className="inline-flex h-11 items-center justify-center gap-3 rounded-md border border-muted bg-[#fcfcfc] px-5 text-lg leading-[22px] font-medium text-primary shadow-[inset_0px_-5px_3px_0px_#f4f4f5,inset_0px_0px_0px_3px_white] transition hover:bg-brand-50 focus-visible:ring-3 focus-visible:ring-white/60 focus-visible:outline-none"
          >
            {tujuanAplikasi ? "Buka Aplikasi" : "Mulai Perjalananmu"}
            <SquareArrowRight aria-hidden className="size-6" />
          </Link>
        </div>
      </div>
    </section>
  );
}

const FITUR = [
  {
    judul: "Check-in harian",
    isi: "Rekam video singkat atau ambil foto saat minum obat sebagai bukti rutinitas harian yang tercatat rapi.",
  },
  {
    judul: "Laporan efek samping",
    isi: "Rasakan mual, pusing, atau keluhan lain? Laporkan dalam beberapa ketukan agar petugas bisa segera membantu.",
  },
  {
    judul: "Pemantauan petugas",
    isi: "Petugas puskesmas melihat perkembangan Anda setiap hari dan menindaklanjuti bila ada jadwal yang terlewat.",
  },
];

// 2. Tentang Kami + kartu fitur
export function TentangLanding({ tujuanAplikasi }: { tujuanAplikasi: string | null }) {
  return (
    <section id="tentang" className="scroll-mt-[74px] bg-white py-16 lg:py-[82px]">
      <div className={`${wadah} flex flex-col gap-[62px]`}>
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-end lg:gap-24">
          {/* Komposisi foto */}
          <div className="grid w-full max-w-[402px] shrink-0 grid-cols-2 gap-6">
            <div className="flex flex-col gap-[18px]">
              <div className="relative aspect-[189/268] overflow-hidden rounded-md">
                <Image src="/images/landing-tim.jpg" alt="" fill sizes="(min-width: 1024px) 189px, 45vw" className="object-cover" />
              </div>
              <div className="flex flex-col gap-1 rounded-md bg-muted p-3.5">
                <p className="text-base leading-5 font-medium text-foreground">Pasien & PMO</p>
                <p className="text-xs leading-4 text-muted-foreground">Didampingi bersama keluarga</p>
              </div>
            </div>
            <div className="flex flex-col gap-[18px]">
              <div className="flex flex-col items-center gap-2 rounded-md bg-muted p-3.5 text-center">
                <p className="text-2xl leading-8 font-medium text-foreground">180 Hari</p>
                <p className="text-base leading-5 text-foreground">Pendampingan</p>
              </div>
              <div className="relative aspect-[189/252] overflow-hidden rounded-md">
                <Image src="/images/auth-daftar.jpg" alt="" fill sizes="(min-width: 1024px) 189px, 45vw" className="object-cover" />
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-12">
            <div className="flex flex-col gap-[22px]">
              <div className="flex flex-col gap-4">
                <Tag>Tentang Kami</Tag>
                <h2 className="text-[28px] leading-9 font-medium text-foreground sm:text-[36px] sm:leading-[49px]">
                  Kami Mendukung Penuh Masa Pemulihan Anda
                </h2>
              </div>
              <p className="text-base leading-5 text-muted-foreground">
                Aplikasi ini membantu Anda dan pendamping minum obat (PMO) menjaga jadwal pengobatan, mencatat setiap
                keluhan, dan terhubung langsung dengan petugas puskesmas untuk pemantauan yang lebih baik.
              </p>
            </div>
            <TombolUtama href={tujuanAplikasi ?? "/daftar"}>
              {tujuanAplikasi ? "Buka Aplikasi" : "Daftar Sekarang"}
            </TombolUtama>
          </div>
        </div>

        <ul className="grid gap-6 md:grid-cols-3">
          {FITUR.map((fitur, i) => (
            <li key={fitur.judul} className="flex flex-col gap-8 rounded-md bg-muted p-6">
              <div className="flex items-center justify-between gap-4 text-xl leading-6 font-medium text-foreground">
                <h3>{fitur.judul}</h3>
                <span aria-hidden>{String(i + 1).padStart(2, "0")}</span>
              </div>
              <p className="text-base leading-5 text-muted-foreground">{fitur.isi}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const LANGKAH = [
  { judul: "Daftar Akun", isi: "Dihubungkan petugas" },
  { judul: "Lakukan Check-in", isi: "Rekam dan unggah" },
  { judul: "Pemantauan Aman", isi: "Ditinjau petugas" },
];

// 3. Cara kerja: 3 langkah
export function CaraKerjaLanding({ tujuanAplikasi }: { tujuanAplikasi: string | null }) {
  return (
    <section id="cara-kerja" className="scroll-mt-[74px] py-16 lg:py-[82px]">
      <div className={`${wadah} flex flex-col items-center gap-12 lg:flex-row lg:items-end lg:gap-24`}>
        <div className="flex flex-1 flex-col gap-12">
          <div className="flex flex-col gap-[22px]">
            <div className="flex flex-col gap-4">
              <Tag>Cara Kerja</Tag>
              <h2 className="text-[30px] leading-[38px] font-medium text-foreground sm:text-[40px] sm:leading-[48px]">
                Mulai Rutinitas Anda dengan 3 Langkah Mudah
              </h2>
            </div>
            <p className="text-base leading-5 text-muted-foreground">
              Dirancang agar mudah digunakan siapa saja, termasuk orang tua. Cukup dengan ponsel, Anda bisa memastikan
              jadwal pengobatan berjalan lancar dan selalu dalam pantauan petugas kesehatan.
            </p>
          </div>
          <TombolUtama href={tujuanAplikasi ?? "/daftar"}>
            {tujuanAplikasi ? "Buka Aplikasi" : "Mulai Sekarang"}
          </TombolUtama>
        </div>

        {/* Foto dengan kartu langkah menumpuk di kiri */}
        <div className="relative w-full max-w-[525px] shrink-0 pt-6 sm:pt-0">
          <div className="relative ml-auto aspect-[391/346] w-full overflow-hidden rounded-[20px] sm:w-[75%]">
            <Image
              src="/images/landing-pendampingan.jpg"
              alt=""
              fill
              sizes="(min-width: 640px) 391px, 100vw"
              className="object-cover"
            />
          </div>
          <ol className="mt-4 flex flex-col gap-3.5 sm:absolute sm:top-1/2 sm:left-0 sm:mt-0 sm:w-[269px] sm:-translate-y-1/2">
            {LANGKAH.map((langkah, i) => (
              <li
                key={langkah.judul}
                className="flex items-start gap-3.5 rounded-[20px] bg-white p-[22px] shadow-[0px_6px_18px_0px_rgba(0,0,0,0.06)]"
              >
                <CircleCheck aria-hidden className="size-6 shrink-0 text-primary" />
                <div className="flex flex-col gap-1">
                  <p className="text-lg leading-[22px] font-medium text-foreground">
                    <span className="sr-only">Langkah {i + 1}: </span>
                    {langkah.judul}
                  </p>
                  <p className="text-base leading-5 text-muted-foreground">{langkah.isi}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

// 4. Kenapa penting (menggantikan testimoni template, supaya tidak ada ulasan fiktif)
export function AlasanLanding() {
  return (
    <section className="py-16 lg:py-[82px]">
      <div className={`${wadah} flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-24`}>
        <div className="flex flex-1 flex-col gap-[22px]">
          <div className="flex flex-col gap-4">
            <Tag>Kenapa Penting</Tag>
            <h2 className="text-[30px] leading-[38px] font-medium text-foreground sm:text-[40px] sm:leading-[48px]">
              Pengobatan Tuntas Dimulai dari Kebiasaan Harian
            </h2>
          </div>
          <p className="text-base leading-5 text-muted-foreground">
            Pengobatan perlu dijalani setiap hari sampai selesai. Dukungan keluarga dan petugas kesehatan membuat
            perjalanan ini terasa lebih ringan.
          </p>
        </div>

        <div className="flex flex-1 flex-col gap-6 rounded-md bg-muted p-6 sm:p-8">
          <CalendarCheck aria-hidden className="size-8 text-primary" />
          <p className="text-lg leading-[26px] text-foreground sm:text-xl sm:leading-7">
            Pengobatan berlangsung setiap hari selama sekitar 6 bulan. Berhenti di tengah jalan dapat membuat
            pengobatan harus diulang dari awal dan obat menjadi kurang ampuh.
          </p>
          <div className="flex flex-col gap-1 border-t border-border pt-4">
            <p className="text-base leading-5 font-medium text-foreground">Peran PMO</p>
            <p className="text-sm leading-[18px] text-muted-foreground">
              Pendamping minum obat, biasanya anggota keluarga, membantu memastikan obat diminum setiap hari.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// 5. Footer
export function FooterLanding() {
  return (
    <footer className="border-t bg-white py-12">
      <div className={`${wadah} flex flex-col gap-10 md:flex-row md:items-start md:justify-between`}>
        <div className="flex max-w-sm flex-col gap-3">
          <LogoAplikasi />
          <p className="text-sm leading-[18px] text-muted-foreground">
            Pendampingan minum obat harian untuk pasien, keluarga, dan petugas puskesmas.
          </p>
        </div>

        <nav aria-label="Tautan footer" className="grid grid-cols-2 gap-x-12 gap-y-3 text-base leading-5">
          <a href="#beranda" className="text-foreground hover:text-primary">Beranda</a>
          <Link href="/login" className="text-foreground hover:text-primary">Masuk</Link>
          <a href="#tentang" className="text-foreground hover:text-primary">Tentang Kami</a>
          <Link href="/daftar" className="text-foreground hover:text-primary">Daftar</Link>
          <a href="#cara-kerja" className="text-foreground hover:text-primary">Cara Kerja</a>
        </nav>
      </div>
      <div className={`${wadah} mt-10`}>
        <p className="text-sm leading-[18px] text-muted-foreground">
          © 2026 Pendamping Minum Obat. Dibuat untuk Hackathon JOINTS UGM 2026.
        </p>
      </div>
    </footer>
  );
}
