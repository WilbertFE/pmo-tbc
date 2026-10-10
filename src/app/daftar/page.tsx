import type { Metadata } from "next";
import Link from "next/link";
import { AuthPemisah, AuthShell } from "@/components/auth/auth-shell";
import { GoogleButton } from "@/components/auth/google-button";
import { DaftarForm } from "./components/daftar-form";

export const metadata: Metadata = {
  title: "Daftar",
};

export default function DaftarPage() {
  return (
    <AuthShell
      foto="/images/auth-daftar.jpg"
      judulKartu="Mulai Langkah Pertama Anda"
      isiKartu="Buat akun dalam satu menit. Setelah itu petugas puskesmas akan menghubungkan akun Anda dengan jadwal pengobatan."
    >
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-medium text-foreground sm:text-[32px] sm:leading-10">Daftar dan Bergabung</h1>
        <p className="text-base leading-5 text-muted-foreground">
          Sudah memiliki akun?{" "}
          <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            Masuk
          </Link>
        </p>
      </div>

      <GoogleButton />
      <AuthPemisah teks="Atau dengan Email" />
      <DaftarForm />
    </AuthShell>
  );
}
