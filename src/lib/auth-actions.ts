"use server";

import { redirect } from "next/navigation";
import { getOriginSaatIni } from "@/lib/origin";
import { createClient } from "@/lib/supabase/server";

// Mulai login Google lewat Supabase, lalu arahkan browser ke halaman Google.
// Setelah itu Google mengembalikan pengguna ke /api/auth/callback.
export async function masukDenganGoogle() {
  const supabase = await createClient();
  const origin = await getOriginSaatIni();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/api/auth/callback`,
      queryParams: { prompt: "select_account" },
    },
  });

  if (error || !data.url) {
    redirect("/login?error=google");
  }

  redirect(data.url);
}
