import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { halamanUtama } from "@/lib/peran";
import type { Database } from "./database.types";

// Dipanggil dari src/proxy.ts di setiap request:
// 1. me-refresh session Supabase dan menulis cookie barunya
// 2. mengarahkan pengguna sesuai login dan peran
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([key, value]) =>
            response.headers.set(key, value),
          );
        },
      },
    },
  );

  // Jangan taruh kode lain di antara createServerClient dan getClaims,
  // supaya session tidak ter-logout secara acak.
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  const path = request.nextUrl.pathname;
  const diAreaPasien = path.startsWith("/pasien");
  const diAreaNakes = path.startsWith("/nakes");
  const diMenunggu = path.startsWith("/menunggu-verifikasi");
  // Halaman untuk tamu: yang sudah login diarahkan ke halaman utamanya
  const diHalamanTamu = path.startsWith("/login") || path.startsWith("/daftar");

  if (!diAreaPasien && !diAreaNakes && !diMenunggu && !diHalamanTamu) {
    return response;
  }

  if (!userId) {
    return diHalamanTamu ? response : alihkan(request, response, "/login");
  }

  const { data: profil } = await supabase
    .from("profiles")
    .select("peran")
    .eq("id", userId)
    .single();

  // Login berhasil tapi belum punya profil: biarkan di halaman tamu
  if (!profil) {
    return diHalamanTamu ? response : alihkan(request, response, "/login");
  }

  if (profil.peran === "nakes") {
    return diAreaNakes ? response : alihkan(request, response, "/nakes");
  }

  // Pasien atau PMO: harus sudah dihubungkan nakes ke baris pasien sebelum bisa memakai /pasien.
  // Kalau belum, arahkan ke /menunggu-verifikasi. Kalau sudah, ke /pasien.
  const { data: pasien } = await supabase
    .from("pasien")
    .select("id")
    .or(`profile_id.eq.${userId},pmo_id.eq.${userId}`)
    .limit(1)
    .maybeSingle();

  const tujuan = pasien ? halamanUtama(profil.peran) : "/menunggu-verifikasi";
  return path.startsWith(tujuan) ? response : alihkan(request, response, tujuan);
}

// Redirect sambil membawa cookie session yang mungkin baru di-refresh
function alihkan(request: NextRequest, response: NextResponse, path: string) {
  const url = request.nextUrl.clone();
  url.pathname = path;
  url.search = "";
  const redirect = NextResponse.redirect(url);
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  response.headers.forEach((value, key) => {
    if (key !== "set-cookie") redirect.headers.set(key, value);
  });
  return redirect;
}
