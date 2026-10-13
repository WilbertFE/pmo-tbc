import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getGemini } from "@/lib/gemini";
import { MAKS_UKURAN_CEK_BYTES, nilaiBuktiCheckin, tipeMedia } from "@/lib/cek-bukti-ai";

// Video perlu waktu beberapa detik untuk dinilai
export const maxDuration = 60;

// Cek awal bukti check-in dengan AI. Hasil disimpan di cek_ai_checkin dan dipakai ulang
// selama pasien belum mengirim bukti baru. RLS memastikan nakes hanya bisa mengecek pasiennya sendiri.
export async function POST(request: Request) {
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

  const body = await request.json().catch(() => null);
  const checkinId = typeof body?.checkinId === "string" ? body.checkinId : null;
  if (!checkinId) {
    return NextResponse.json({ error: "checkinId wajib diisi" }, { status: 400 });
  }

  const { data: checkin } = await supabase
    .from("checkin")
    .select("id, pasien_id, media_path")
    .eq("id", checkinId)
    .maybeSingle();

  if (!checkin?.media_path) {
    return NextResponse.json({ error: "Media bukti tidak ditemukan" }, { status: 404 });
  }

  // Pakai hasil tersimpan kalau medianya masih sama
  const { data: tersimpan } = await supabase
    .from("cek_ai_checkin")
    .select("*")
    .eq("checkin_id", checkin.id)
    .maybeSingle();

  if (tersimpan && tersimpan.media_path === checkin.media_path) {
    return NextResponse.json({ hasil: tersimpan });
  }

  const ai = getGemini();
  if (!ai) {
    return NextResponse.json({ error: "Cek AI belum diaktifkan" }, { status: 503 });
  }

  const { data: berkas, error: unduhError } = await supabase.storage
    .from("checkin-media")
    .download(checkin.media_path);

  if (unduhError || !berkas) {
    return NextResponse.json({ error: "Gagal membuka media bukti" }, { status: 500 });
  }
  if (berkas.size > MAKS_UKURAN_CEK_BYTES) {
    return NextResponse.json({ error: "Media terlalu besar untuk dicek AI" }, { status: 413 });
  }

  const mimeType = tipeMedia(checkin.media_path, berkas.type);
  if (!mimeType) {
    return NextResponse.json({ error: "Format media tidak didukung" }, { status: 415 });
  }

  try {
    const hasil = await nilaiBuktiCheckin(ai, await berkas.arrayBuffer(), mimeType);

    const baris = {
      checkin_id: checkin.id,
      pasien_id: checkin.pasien_id,
      media_path: checkin.media_path,
      ...hasil,
      created_at: new Date().toISOString(),
    };

    const { data: disimpan, error: simpanError } = await supabase
      .from("cek_ai_checkin")
      .upsert(baris, { onConflict: "checkin_id" })
      .select("*")
      .single();

    if (simpanError) {
      // Hasil tetap dikirim walau gagal disimpan, supaya nakes tidak menunggu sia-sia
      console.error("Gagal menyimpan hasil cek AI:", simpanError);
      return NextResponse.json({ hasil: baris });
    }

    return NextResponse.json({ hasil: disimpan });
  } catch (error) {
    console.error("Gagal cek AI:", error);
    return NextResponse.json({ error: "AI gagal menilai bukti ini. Coba lagi nanti." }, { status: 502 });
  }
}
