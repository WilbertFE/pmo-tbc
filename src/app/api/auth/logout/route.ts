import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Keluar dari akun. Pakai dari form: <form action="/api/auth/logout" method="post">
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  // 303 supaya browser pindah ke /login dengan GET
  return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
}
