import Image from "next/image";
import type { ReactNode } from "react";

type AuthShellProps = {
  foto: string;
  // Class Tailwind posisi potongan foto agar sesuai desain Figma, contoh "object-[81%_50%]"
  posisiFoto?: string;
  judulKartu: string;
  isiKartu: string;
  children: ReactNode;
};

// Tata letak halaman masuk dan daftar: foto di kiri (desktop), form di kanan.
// Di layar kecil foto disembunyikan supaya form langsung terlihat.
export function AuthShell({ foto, posisiFoto = "object-center", judulKartu, isiKartu, children }: AuthShellProps) {
  return (
    <main className="grid min-h-svh flex-1 bg-background lg:grid-cols-2">
      <div className="relative hidden flex-col justify-end p-[60px] lg:flex">
        <Image
          src={foto}
          alt=""
          fill
          priority
          sizes="50vw"
          className={`object-cover ${posisiFoto}`}
        />
        <div className="relative flex flex-col gap-3 rounded-xl bg-white p-6">
          <p className="text-xl leading-[27px] font-medium text-foreground">{judulKartu}</p>
          <p className="text-base leading-[22px] text-muted-foreground">{isiKartu}</p>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-12 sm:px-12 lg:px-[82px]">
        <div className="flex w-full max-w-[556px] flex-col gap-[34px]">{children}</div>
      </div>
    </main>
  );
}

// Garis pemisah "Atau dengan Email"
export function AuthPemisah({ teks }: { teks: string }) {
  return (
    <div className="flex items-center gap-[18px]">
      <span className="h-px flex-1 bg-border" />
      <span className="text-base leading-5 text-muted-foreground">{teks}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

// Pesan sukses atau gagal di atas form
export function AuthPesan({ jenis, children }: { jenis: "error" | "sukses"; children: ReactNode }) {
  const gaya =
    jenis === "error"
      ? "border-alert/30 bg-alert-subtle text-[#b3261e]"
      : "border-brand-200 bg-brand-50 text-brand-700";

  return (
    <div role={jenis === "error" ? "alert" : "status"} className={`rounded-md border px-4 py-3 text-sm leading-5 ${gaya}`}>
      {children}
    </div>
  );
}
