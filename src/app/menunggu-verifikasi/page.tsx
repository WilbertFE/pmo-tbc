import type { Metadata } from "next";
import Link from "next/link";
import { Clock, LogOut } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { getProfilSaatIni } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Menunggu Verifikasi",
};

// Untuk pengguna yang sudah punya akun tetapi belum dihubungkan nakes ke data pengobatan.
// src/proxy.ts mengarahkan ke sini, dan otomatis mengarahkan ke /pasien setelah data tersedia.
export default async function MenungguVerifikasiPage() {
  const { supabase, profil } = await getProfilSaatIni();
  const { data } = await supabase.auth.getClaims();
  const email = typeof data?.claims?.email === "string" ? data.claims.email : undefined;

  return (
    <main className="flex flex-1 items-center justify-center bg-muted/40 px-6 py-12">
      <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-xl border bg-background p-8 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-brand-50">
          <Clock aria-hidden className="size-8 text-primary" />
        </span>

        <div className="flex flex-col gap-3">
          <h1 className="text-2xl leading-8 font-medium text-foreground">Akun Anda sedang disiapkan</h1>
          <p className="text-base leading-[22px] text-muted-foreground">
            Halo, <span className="font-medium text-foreground">{profil.nama}</span>. Petugas puskesmas perlu
            menghubungkan akun Anda dengan jadwal pengobatan sebelum Anda bisa mulai check-in.
          </p>
          {email && (
            <p className="text-base leading-[22px] text-muted-foreground">
              Sampaikan email ini ke petugas: <span className="font-medium text-foreground">{email}</span>
            </p>
          )}
        </div>

        <div className="flex w-full flex-col gap-3">
          <Link href="/pasien" className={buttonVariants({ className: "h-11 w-full text-base" })}>
            Cek lagi
          </Link>
          <form action="/api/auth/logout" method="post">
            <Button type="submit" variant="ghost" className="h-11 w-full text-base text-muted-foreground">
              <LogOut aria-hidden className="size-5" />
              Keluar
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
