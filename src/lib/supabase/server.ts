import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";

// Client untuk Server Components, Server Actions, dan API route.
// Memakai session pengguna dari cookie, jadi RLS tetap berlaku.
// Buat client baru di setiap request, jangan disimpan di variabel global.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Dipanggil dari Server Component, yang tidak boleh menulis cookie.
            // Aman diabaikan karena src/proxy.ts sudah me-refresh session.
          }
        },
      },
    },
  );
}
