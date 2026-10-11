import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Signed URL berumur pendek untuk media check-in tertentu (dipakai saat meninjau riwayat).
// RLS checkin dan policy storage memastikan nakes hanya bisa membuka media pasiennya sendiri.
export async function GET(request: NextRequest) {
  const checkinId = request.nextUrl.searchParams.get("checkinId");
  if (!checkinId) {
    return NextResponse.json({ error: "Parameter checkinId wajib diisi" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) {
    return NextResponse.json({ error: "Sesi tidak ditemukan atau kedaluwarsa" }, { status: 401 });
  }

  const { data: profil } = await supabase.from("profiles").select("peran").eq("id", userId).single();
  if (!profil || profil.peran !== "nakes") {
    return NextResponse.json({ error: "Akses ditolak: Hanya untuk Nakes" }, { status: 403 });
  }

  const { data: checkin } = await supabase
    .from("checkin")
    .select("media_path")
    .eq("id", checkinId)
    .maybeSingle();

  if (!checkin?.media_path) {
    return NextResponse.json({ error: "Media bukti tidak ditemukan" }, { status: 404 });
  }

  const { data: signed, error } = await supabase.storage
    .from("checkin-media")
    .createSignedUrl(checkin.media_path, 600); // 10 menit

  if (error || !signed) {
    return NextResponse.json({ error: "Gagal membuka media bukti" }, { status: 500 });
  }

  return NextResponse.json({ signedUrl: signed.signedUrl });
}
