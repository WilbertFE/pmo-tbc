"use client";

import { useActionState, useState } from "react";
import { LoaderCircle, LockKeyhole, Mail, MailCheck, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthField } from "@/components/auth/auth-field";
import { AuthPesan } from "@/components/auth/auth-shell";
import { daftar } from "../actions";

export function DaftarForm() {
  const [state, action, pending] = useActionState(daftar, undefined);
  // Terkontrol supaya nama dan email tidak hilang saat form di-reset setelah submit
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");

  if (state?.sukses) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-xl border border-brand-200 bg-brand-50 p-6">
        <MailCheck aria-hidden className="size-8 text-primary" />
        <p role="status" className="text-base leading-[22px] text-brand-700">
          {state.sukses}
        </p>
      </div>
    );
  }

  const err = state?.errorField;

  return (
    <form action={action} className="flex flex-col gap-[34px]" noValidate>
      {state?.error && <AuthPesan jenis="error">{state.error}</AuthPesan>}

      <div className="flex flex-col gap-[22px]">
        <AuthField
          id="nama"
          name="nama"
          label="Nama"
          ikon={User}
          placeholder="Masukkan nama lengkap"
          autoComplete="name"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          error={err?.nama}
          required
        />
        <AuthField
          id="email"
          name="email"
          type="email"
          label="Email"
          ikon={Mail}
          placeholder="Masukkan alamat email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={err?.email}
          required
        />
        <AuthField
          id="password"
          name="password"
          type="password"
          label="Kata Sandi"
          ikon={LockKeyhole}
          placeholder="Minimal 8 karakter"
          autoComplete="new-password"
          error={err?.password}
          required
        />
        <AuthField
          id="konfirmasi"
          name="konfirmasi"
          type="password"
          label="Konfirmasi Kata Sandi"
          ikon={LockKeyhole}
          placeholder="Masukkan ulang kata sandi"
          autoComplete="new-password"
          error={err?.konfirmasi}
          required
        />
      </div>

      <Button type="submit" disabled={pending} className="h-11 w-full text-lg font-medium">
        {pending && <LoaderCircle className="size-5 animate-spin" />}
        {pending ? "Sedang mendaftar..." : "Daftar"}
      </Button>
    </form>
  );
}
