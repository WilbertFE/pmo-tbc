"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, House, MessageCircleQuestion, Stethoscope, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const MENU = [
  { href: "/pasien", label: "Beranda", ikon: House },
  { href: "/pasien/laporan", label: "Check-in", ikon: Camera },
  { href: "/pasien/progress", label: "Progres", ikon: TrendingUp },
  { href: "/pasien/efek-samping", label: "Keluhan", ikon: Stethoscope },
  { href: "/pasien/tanya", label: "Tanya", ikon: MessageCircleQuestion },
];

function aktif(pathname: string, href: string) {
  return href === "/pasien" ? pathname === href : pathname.startsWith(href);
}

// Menu teks di header, hanya tampil di layar lebar
export function MenuAtasPasien() {
  const pathname = usePathname();

  return (
    <nav aria-label="Menu utama" className="hidden items-center gap-1 md:flex">
      {MENU.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          aria-current={aktif(pathname, href) ? "page" : undefined}
          className={cn(
            "rounded-md px-3 py-2 text-sm transition hover:bg-muted",
            aktif(pathname, href) ? "font-medium text-primary" : "text-muted-foreground",
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

// Menu bawah untuk ponsel: ikon besar supaya mudah ditekan
export function MenuBawahPasien() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Menu utama"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {MENU.map(({ href, label, ikon: Ikon }) => (
          <li key={href}>
            <Link
              href={href}
              aria-current={aktif(pathname, href) ? "page" : undefined}
              className={cn(
                "flex h-16 flex-col items-center justify-center gap-1 text-xs transition",
                aktif(pathname, href) ? "font-medium text-primary" : "text-muted-foreground",
              )}
            >
              <Ikon aria-hidden className="size-6" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
