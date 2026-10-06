import type { Peran } from "./supabase/database.types";

// Halaman utama tiap peran setelah login
export function halamanUtama(peran: Peran) {
  return peran === "nakes" ? "/nakes" : "/pasien";
}
