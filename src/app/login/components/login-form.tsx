"use client";

import { useActionState, useState } from "react";
import { LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthField } from "@/components/auth/auth-field";
import { AuthPesan } from "@/components/auth/auth-shell";
import { login } from "../actions";

export function LoginForm({ pesanAwal }: { pesanAwal?: string }) {
  const [state, action, pending] = useActionState(login, undefined);
  // Terkontrol supaya email tidak hilang saat form di-reset setelah submit
  const [email, setEmail] = useState("");
  const pesanError = state?.error ?? pesanAwal;

  return (
    <form action={action} className="flex flex-col gap-[34px]" noValidate>
      {pesanError && <AuthPesan jenis="error">{pesanError}</AuthPesan>}

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
        required
      />
      <AuthField
        id="password"
        name="password"
        type="password"
        label="Sandi"
        ikon={LockKeyhole}
        placeholder="Masukkan kata sandi"
        autoComplete="current-password"
        required
      />

      <Button type="submit" disabled={pending} className="h-11 w-full text-lg font-medium">
        {pending && <LoaderCircle className="size-5 animate-spin" />}
        {pending ? "Sedang masuk..." : "Masuk"}
      </Button>
    </form>
  );
}
