import Link from "next/link";
import { HeartPulse, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MenuAtasPasien, MenuBawahPasien } from "./components/navigasi-pasien";

// Kerangka aplikasi pasien/PMO: header dengan tombol Keluar, menu bawah di ponsel
export default function PasienLayout({ children }: LayoutProps<"/pasien">) {
  return (
    <div className="flex flex-1 flex-col pb-16 md:pb-0">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 lg:px-8">
          <Link href="/pasien" className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <HeartPulse aria-hidden className="size-5" />
            </span>
            <span className="text-sm font-medium">Pendamping Minum Obat</span>
          </Link>

          <MenuAtasPasien />

          <form action="/api/auth/logout" method="post">
            <Button type="submit" variant="ghost" className="h-10 text-muted-foreground">
              <LogOut aria-hidden className="size-5" />
              Keluar
            </Button>
          </form>
        </div>
      </header>

      {children}

      <MenuBawahPasien />
    </div>
  );
}
