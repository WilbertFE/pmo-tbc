import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { tanggalWIB, tambahHari } from "@/lib/tanggal";
import { hitungProgres } from "@/lib/progres";
import { tentukanStatusPasien, urutkanPrioritasPasien } from "@/lib/status-pasien";

export async function GET() {
  const supabase = await createClient();

  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) {
    return NextResponse.json({ error: "Sesi tidak ditemukan atau kedaluwarsa" }, { status: 401 });
  }

  // Verifikasi peran nakes
  const { data: profilNakes, error: errProfil } = await supabase
    .from("profiles")
    .select("id, nama, peran")
    .eq("id", userId)
    .single();

  if (errProfil || !profilNakes || profilNakes.peran !== "nakes") {
    return NextResponse.json({ error: "Akses ditolak: Hanya untuk Nakes" }, { status: 403 });
  }

  // Ambil daftar pasien yang ditangani oleh nakes ini
  const { data: daftarPasien, error: errPasien } = await supabase
    .from("pasien")
    .select(`
      id,
      profile_id,
      pmo_id,
      nakes_id,
      tanggal_mulai,
      durasi_hari,
      jam_minum,
      profil_pasien:profiles!pasien_profile_id_fkey(nama),
      profil_pmo:profiles!pasien_pmo_id_fkey(nama)
    `)
    .eq("nakes_id", userId);

  if (errPasien) {
    return NextResponse.json({ error: errPasien.message }, { status: 500 });
  }

  if (!daftarPasien || daftarPasien.length === 0) {
    return NextResponse.json({
      nakes: { id: profilNakes.id, nama: profilNakes.nama },
      ringkasan: { total: 0, merah: 0, kuning: 0, hijau: 0 },
      pasien: [],
    });
  }

  const hariIni = tanggalWIB();
  const kemarin = tambahHari(hariIni, -1);
  const tigaHariLalu = tambahHari(hariIni, -3);

  const pasienIds = daftarPasien.map((p) => p.id);

  // Ambil check-in hari ini dan kemarin untuk semua pasien
  const { data: checkinList } = await supabase
    .from("checkin")
    .select("id, pasien_id, tanggal, media_path, status, created_at")
    .in("pasien_id", pasienIds)
    .in("tanggal", [hariIni, kemarin]);

  // Ambil efek samping dalam rentang 3-7 hari terakhir
  const { data: efekSampingList } = await supabase
    .from("efek_samping")
    .select("id, pasien_id, jenis, tingkat, catatan, created_at")
    .in("pasien_id", pasienIds)
    .gte("created_at", `${tigaHariLalu}T00:00:00+07:00`)
    .order("created_at", { ascending: false });

  // Ambil catatan tindak lanjut terbaru untuk pasien
  const { data: tindakLanjutList } = await supabase
    .from("tindak_lanjut")
    .select("id, pasien_id, nakes_id, catatan, created_at")
    .in("pasien_id", pasienIds)
    .order("created_at", { ascending: false });

  // Proses data setiap pasien
  const pasienDenganStatus = await Promise.all(
    daftarPasien.map(async (pasien) => {
      const checkinHariIni = checkinList?.find(
        (c) => c.pasien_id === pasien.id && c.tanggal === hariIni,
      );
      const checkinKemarin = checkinList?.find(
        (c) => c.pasien_id === pasien.id && c.tanggal === kemarin,
      );

      const efekSampingPasien = (efekSampingList || []).filter(
        (e) => e.pasien_id === pasien.id,
      );

      const tindakLanjutPasien = (tindakLanjutList || []).filter(
        (t) => t.pasien_id === pasien.id,
      );

      // Siapkan ringkasan efek samping untuk fungsi early warning
      const daftarEfekSampingRingkas = efekSampingPasien.map((e) => ({
        tingkat: e.tingkat as "ringan" | "sedang" | "berat",
        tanggal: tanggalWIB(new Date(e.created_at || new Date().toISOString())),
      }));

      // Tentukan status early warning
      const hasilStatus = tentukanStatusPasien({
        jamMinum: pasien.jam_minum,
        sudahCheckInHariIni: Boolean(checkinHariIni),
        sudahCheckInKemarin: Boolean(checkinKemarin),
        daftarEfekSampingTerakhir: daftarEfekSampingRingkas,
      });

      // Hitung progres pengobatan
      const progres = hitungProgres(pasien.tanggal_mulai, pasien.durasi_hari, hariIni);

      // Buat signed URL jika ada media_path pada check-in hari ini
      let signedMediaUrl: string | null = null;
      if (checkinHariIni?.media_path) {
        const { data: signedData } = await supabase.storage
          .from("checkin-media")
          .createSignedUrl(checkinHariIni.media_path, 3600); // Masa berlaku 1 jam
        signedMediaUrl = signedData?.signedUrl ?? null;
      }

      const namaPasien =
        (pasien.profil_pasien as { nama?: string } | null)?.nama ?? "Pasien";
      const namaPmo =
        (pasien.profil_pmo as { nama?: string } | null)?.nama ?? "-";

      return {
        id: pasien.id,
        nama: namaPasien,
        namaPmo,
        jamMinum: pasien.jam_minum,
        tanggalMulai: pasien.tanggal_mulai,
        durasiHari: pasien.durasi_hari,
        progres,
        status: hasilStatus.status,
        alasanStatus: hasilStatus.alasan,
        keteranganStatus: hasilStatus.keterangan,
        checkinHariIni: checkinHariIni
          ? {
              id: checkinHariIni.id,
              status: checkinHariIni.status,
              mediaPath: checkinHariIni.media_path,
              signedMediaUrl,
              createdAt: checkinHariIni.created_at,
            }
          : null,
        riwayatEfekSamping: efekSampingPasien,
        riwayatTindakLanjut: tindakLanjutPasien,
      };
    }),
  );

  // Urutkan pasien: Merah paling atas, lalu Kuning, lalu Hijau
  const hasilUrut = urutkanPrioritasPasien(pasienDenganStatus);

  const ringkasan = {
    total: hasilUrut.length,
    merah: hasilUrut.filter((p) => p.status === "merah").length,
    kuning: hasilUrut.filter((p) => p.status === "kuning").length,
    hijau: hasilUrut.filter((p) => p.status === "hijau").length,
  };

  return NextResponse.json({
    nakes: { id: profilNakes.id, nama: profilNakes.nama },
    ringkasan,
    pasien: hasilUrut,
  });
}
