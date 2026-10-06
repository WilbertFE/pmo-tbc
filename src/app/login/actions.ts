"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { halamanUtama } from "@/lib/peran";

export type LoginState = { error?: string } | undefined;

export async function login(_state: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email dan kata sandi wajib diisi." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { error: "Email atau kata sandi salah." };
  }

  const { data: profil } = await supabase
    .from("profiles")
    .select("peran")
    .eq("id", data.user.id)
    .single();

  if (!profil) {
    await supabase.auth.signOut();
    return { error: "Akun belum terdaftar. Hubungi petugas puskesmas." };
  }

  redirect(halamanUtama(profil.peran));
}
