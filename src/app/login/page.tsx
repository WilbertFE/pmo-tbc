import type { Metadata } from "next";
import Link from "next/link";
import { AuthPemisah, AuthShell } from "@/components/auth/auth-shell";
import { GoogleButton } from "@/components/auth/google-button";
import { LoginForm } from "./components/login-form";

export const metadata: Metadata = {
  title: "Masuk",
};

// Pesan dari redirect, misalnya setelah login Google dibatalkan
const PESAN_ERROR: Record<string, string> = {
  google: "Masuk dengan Google gagal. Silakan coba lagi.",
  tautan: "Tautan sudah tidak berlaku. Silakan masuk atau daftar ulang.",
  profil: "Akun belum terdaftar. Hubungi petugas puskesmas.",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error } = await searchParams;
  const pesanAwal = typeof error === "string" ? PESAN_ERROR[error] : undefined;

  return (
    <AuthShell
      foto="/images/auth-masuk.jpg"
      posisiFoto="object-[81%_50%]"
      judulKartu="Teman Setia Selama Pengobatan"
      isiKartu="Catat minum obat setiap hari dan tetap terhubung dengan petugas puskesmas, langsung dari ponsel Anda."
    >
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-medium text-foreground sm:text-[40px] sm:leading-[48px]">
          Masuk ke Akun Anda
        </h1>
        <p className="text-base leading-5 text-muted-foreground">
          Belum mempunyai akun?{" "}
          <Link href="/daftar" className="font-medium text-primary underline-offset-4 hover:underline">
            Daftar
          </Link>
        </p>
      </div>

      <GoogleButton />
      <AuthPemisah teks="Atau dengan Email" />
      <LoginForm pesanAwal={pesanAwal} />
    </AuthShell>
  );
}
