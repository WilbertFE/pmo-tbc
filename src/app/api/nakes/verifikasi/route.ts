import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) {
    return NextResponse.json({ error: "Sesi tidak ditemukan atau kedaluwarsa" }, { status: 401 });
  }

  // Verifikasi peran nakes
  const { data: profilNakes, error: errProfil } = await supabase
    .from("profiles")
    .select("peran")
    .eq("id", userId)
    .single();

  if (errProfil || !profilNakes || profilNakes.peran !== "nakes") {
    return NextResponse.json({ error: "Akses ditolak: Hanya untuk Nakes" }, { status: 403 });
  }

  let body: { checkinId?: string; status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Format request body tidak valid" }, { status: 400 });
  }

  const { checkinId, status } = body;

  if (!checkinId || !status || !["terverifikasi", "ditolak"].includes(status)) {
    return NextResponse.json(
      { error: "Parameter checkinId dan status ('terverifikasi' atau 'ditolak') wajib diisi" },
      { status: 400 },
    );
  }

  // Update status check-in (RLS memastikan nakes hanya bisa update pasien yang ditangani)
  const { data: updatedCheckin, error: errUpdate } = await supabase
    .from("checkin")
    .update({ status: status as "terverifikasi" | "ditolak" })
    .eq("id", checkinId)
    .select()
    .single();

  if (errUpdate) {
    return NextResponse.json({ error: errUpdate.message }, { status: 500 });
  }

  return NextResponse.json({
    message: `Status check-in berhasil diubah menjadi ${status}`,
    data: updatedCheckin,
  });
}
