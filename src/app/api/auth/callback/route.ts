import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { halamanUtama } from "@/lib/peran";

// Tujuan kembali setelah login Google atau klik tautan konfirmasi email.
// URL ini wajib didaftarkan di Supabase: Authentication > URL Configuration > Redirect URLs.
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const keLogin = (error: string) => NextResponse.redirect(new URL(`/login?error=${error}`, request.url));

  // Pengguna membatalkan di halaman Google, atau tautan email sudah kedaluwarsa
  if (searchParams.get("error")) {
    return keLogin(searchParams.get("error_code") === "otp_expired" ? "tautan" : "google");
  }
  if (!code) {
    return keLogin("tautan");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return keLogin("tautan");
  }

  const { data: profil } = await supabase
    .from("profiles")
    .select("peran")
    .eq("id", data.user.id)
    .single();

  if (!profil) {
    await supabase.auth.signOut();
    return keLogin("profil");
  }

  return NextResponse.redirect(new URL(halamanUtama(profil.peran), request.url));
}
