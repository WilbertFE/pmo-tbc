import { NextResponse } from "next/server";
import { getPasienSaya } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { supabase, profil, pasien } = await getPasienSaya();

    if (!pasien) {
      return NextResponse.json(
        { error: "Data pasien tidak ditemukan." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { jenis, tingkat, catatan } = body;

    if (!jenis || !tingkat) {
      return NextResponse.json(
        { error: "Jenis dan tingkat efek samping wajib diisi." },
        { status: 400 }
      );
    }

    // Validasi tingkat efek samping
    if (!["ringan", "sedang", "berat"].includes(tingkat)) {
      return NextResponse.json(
        { error: "Tingkat efek samping tidak valid." },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("efek_samping").insert({
      pasien_id: pasien.id,
      jenis,
      tingkat,
      catatan: catatan || null,
    });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error submit efek samping:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal server." },
      { status: 500 }
    );
  }
}
