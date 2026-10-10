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

  let body: { pasienId?: string; catatan?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Format request body tidak valid" }, { status: 400 });
  }

  const { pasienId, catatan } = body;

  if (!pasienId || !catatan || catatan.trim() === "") {
    return NextResponse.json(
      { error: "Parameter pasienId dan catatan wajib diisi" },
      { status: 400 },
    );
  }

  // Simpan catatan tindak lanjut ke database
  const { data: hasil, error: errInsert } = await supabase
    .from("tindak_lanjut")
    .insert({
      pasien_id: pasienId,
      nakes_id: userId,
      catatan: catatan.trim(),
    })
    .select()
    .single();

  if (errInsert) {
    return NextResponse.json({ error: errInsert.message }, { status: 500 });
  }

  return NextResponse.json({
    message: "Catatan tindak lanjut berhasil disimpan",
    data: hasil,
  });
}
