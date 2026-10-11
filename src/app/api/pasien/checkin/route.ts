import { NextResponse } from "next/server";
import { getPasienSaya } from "@/lib/auth";
import { tanggalWIB } from "@/lib/tanggal";

export async function POST(request: Request) {
  try {
    const { supabase, pasien } = await getPasienSaya();

    if (!pasien) {
      return NextResponse.json(
        { error: "Data pasien tidak ditemukan." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { media_path, tanggal, catatan } = body;

    if (!media_path || typeof media_path !== "string") {
      return NextResponse.json(
        { error: "Bukti minum obat (media) wajib diunggah." },
        { status: 400 }
      );
    }

    const tanggalCheckin =
      typeof tanggal === "string" && tanggal ? tanggal : tanggalWIB();

    // Cek apakah check-in untuk tanggal ini sudah ada
    const { data: existingCheckin, error: selectError } = await supabase
      .from("checkin")
      .select("id, status")
      .eq("pasien_id", pasien.id)
      .eq("tanggal", tanggalCheckin)
      .maybeSingle();

    if (selectError) {
      console.error("Gagal memeriksa check-in:", selectError);
      return NextResponse.json(
        { error: "Gagal memeriksa data check-in." },
        { status: 500 }
      );
    }

    if (existingCheckin && existingCheckin.status === "terverifikasi") {
      return NextResponse.json(
        { error: "Check-in hari ini sudah terverifikasi dan tidak dapat diubah." },
        { status: 400 }
      );
    }

    if (existingCheckin) {
      const { error: updateError } = await supabase
        .from("checkin")
        .update({
          media_path,
          status: "menunggu",
        })
        .eq("id", existingCheckin.id);

      if (updateError) {
        console.error("Gagal memperbarui check-in:", updateError);
        return NextResponse.json(
          { error: "Gagal memperbarui data check-in." },
          { status: 500 }
        );
      }
    } else {
      const { error: insertError } = await supabase
        .from("checkin")
        .insert({
          pasien_id: pasien.id,
          tanggal: tanggalCheckin,
          media_path,
          status: "menunggu",
        });

      if (insertError) {
        console.error("Gagal menyimpan check-in:", insertError);
        return NextResponse.json(
          { error: "Gagal menyimpan data check-in." },
          { status: 500 }
        );
      }
    }

    // Jika ada keluhan atau catatan efek samping, catat ke tabel efek_samping
    if (catatan && typeof catatan === "string" && catatan.trim()) {
      const { error: efekError } = await supabase.from("efek_samping").insert({
        pasien_id: pasien.id,
        jenis: catatan.trim().slice(0, 500),
        tingkat: "ringan",
        catatan: null,
      });

      if (efekError) {
        console.error("Gagal mencatat keluhan efek samping:", efekError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error submit checkin:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal server." },
      { status: 500 }
    );
  }
}
