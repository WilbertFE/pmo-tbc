import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { selisihHari, tambahHari, tanggalWIB } from "@/lib/tanggal";

const JUMLAH_HARI = 14;

// Persentase pasien yang check-in setiap hari selama 14 hari terakhir (sampai kemarin, WIB).
// Hanya menghitung pasien yang sedang dalam masa pengobatan pada hari tersebut.
export async function GET() {
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

  const hariTerakhir = tambahHari(tanggalWIB(), -1);
  const hariPertama = tambahHari(hariTerakhir, -(JUMLAH_HARI - 1));

  const { data: daftarPasien, error: errPasien } = await supabase
    .from("pasien")
    .select("id, tanggal_mulai, durasi_hari")
    .eq("nakes_id", userId);

  if (errPasien) {
    return NextResponse.json({ error: errPasien.message }, { status: 500 });
  }

  const pasien = daftarPasien ?? [];
  const { data: daftarCheckin, error: errCheckin } = pasien.length
    ? await supabase
        .from("checkin")
        .select("pasien_id, tanggal")
        .in(
          "pasien_id",
          pasien.map((p) => p.id),
        )
        .gte("tanggal", hariPertama)
        .lte("tanggal", hariTerakhir)
    : { data: [], error: null };

  if (errCheckin) {
    return NextResponse.json({ error: errCheckin.message }, { status: 500 });
  }

  const sudahCheckin = new Set((daftarCheckin ?? []).map((c) => `${c.pasien_id}|${c.tanggal}`));

  const harian = Array.from({ length: JUMLAH_HARI }, (_, i) => {
    const tanggal = tambahHari(hariPertama, i);
    const aktif = pasien.filter((p) => {
      const hariKe = selisihHari(p.tanggal_mulai, tanggal) + 1;
      return hariKe >= 1 && hariKe <= p.durasi_hari;
    });
    const jumlahCheckin = aktif.filter((p) => sudahCheckin.has(`${p.id}|${tanggal}`)).length;

    return {
      tanggal,
      jumlahPasien: aktif.length,
      jumlahCheckin,
      persen: aktif.length > 0 ? Math.round((jumlahCheckin / aktif.length) * 100) : null,
    };
  });

  return NextResponse.json({ harian });
}
