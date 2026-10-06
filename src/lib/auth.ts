import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Ambil pengguna yang sedang login beserta profilnya.
// Untuk Server Components dan API route. Mengarahkan ke /login kalau belum login.
export async function getProfilSaatIni() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (!userId) redirect("/login");

  const { data: profil } = await supabase
    .from("profiles")
    .select("id, nama, peran")
    .eq("id", userId)
    .single();

  if (!profil) redirect("/login");

  return { supabase, profil };
}

// Data pengobatan yang dipegang pengguna pasien atau PMO.
// Pasien: baris miliknya sendiri. PMO: pasien yang ia dampingi.
export async function getPasienSaya() {
  const { supabase, profil } = await getProfilSaatIni();
  const kolom = profil.peran === "pmo" ? "pmo_id" : "profile_id";

  const { data: pasien } = await supabase
    .from("pasien")
    .select("*, profil_pasien:profiles!pasien_profile_id_fkey(nama)")
    .eq(kolom, profil.id)
    .maybeSingle();

  return { supabase, profil, pasien };
}
