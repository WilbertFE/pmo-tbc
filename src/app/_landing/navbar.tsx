"use client";

import { useState } from "react";
import Link from "next/link";
import { HeartPulse, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavbarLandingProps {
  // Halaman aplikasi sesuai peran kalau sudah login, null kalau belum
  tujuanAplikasi: string | null;
}

const MENU = [
  { href: "#beranda", label: "Beranda" },
  { href: "#tentang", label: "Tentang Kami" },
  { href: "#cara-kerja", label: "Cara Kerja" },
];

const gayaTombolUtama =
  "inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-base leading-[22px] font-medium text-[#fafafa] transition hover:bg-brand-600 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none";

export function LogoAplikasi() {
  return (
    <Link href="/" className="flex items-center gap-2.5 rounded-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none">
      <span className="flex size-9 items-center justify-center rounded-sm bg-primary text-white">
        <HeartPulse aria-hidden className="size-5" />
      </span>
      <span className="text-base leading-5 font-medium text-foreground">Pendamping Minum Obat</span>
    </Link>
  );
}

export function NavbarLanding({ tujuanAplikasi }: NavbarLandingProps) {
  const [terbuka, setTerbuka] = useState(false);

  const tombolAkun = tujuanAplikasi ? (
    <Link href={tujuanAplikasi} className={gayaTombolUtama}>
      Buka Aplikasi
    </Link>
  ) : (
    <>
      <Link
        href="/login"
        className="inline-flex h-10 items-center rounded-md px-3 text-base leading-[22px] font-medium text-primary transition hover:bg-brand-50"
      >
        Masuk
      </Link>
      <Link href="/daftar" className={gayaTombolUtama}>
        Daftar
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-transparent bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75">
      <div className="mx-auto flex h-[74px] max-w-[1212px] items-center justify-between gap-6 px-6">
        <LogoAplikasi />

        <nav aria-label="Navigasi utama" className="hidden items-center gap-8 md:flex">
          {MENU.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-base leading-5 text-muted-foreground transition hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">{tombolAkun}</div>

        <button
          type="button"
          onClick={() => setTerbuka((v) => !v)}
          aria-expanded={terbuka}
          aria-controls="menu-seluler"
          aria-label={terbuka ? "Tutup menu" : "Buka menu"}
          className="flex size-10 items-center justify-center rounded-md text-foreground hover:bg-muted md:hidden"
        >
          {terbuka ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      <div id="menu-seluler" className={cn("border-t bg-white px-6 pb-6 md:hidden", !terbuka && "hidden")}>
        <nav aria-label="Navigasi seluler" className="flex flex-col py-2">
          {MENU.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setTerbuka(false)}
              className="py-3 text-base leading-5 text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">{tombolAkun}</div>
      </div>
    </header>
  );
}
