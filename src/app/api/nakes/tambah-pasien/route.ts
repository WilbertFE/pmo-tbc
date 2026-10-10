import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const POLA_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const POLA_TANGGAL = /^\d{4}-\d{2}-\d{2}$/;
const POLA_JAM = /^\d{2}:\d{2}(:\d{2})?$/;

// Menghubungkan akun yang sudah mendaftar sendiri ke data pengobatan baru milik nakes ini.
// Pengecekan utama (akun ada, peran pasien, belum terhubung) dilakukan fungsi database
// hubungkan_pasien (migrasi 007).
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

  let body: {
    email?: string;
    emailPmo?: string;
    tanggalMulai?: string;
    jamMinum?: string;
    durasiHari?: number;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Format request body tidak valid" }, { status: 400 });
  }

  const email = body.email?.trim() ?? "";
  const emailPmo = body.emailPmo?.trim() ?? "";
  const tanggalMulai = body.tanggalMulai ?? "";
  const jamMinum = body.jamMinum ?? "";
  const durasiHari = Number(body.durasiHari ?? 180);

  if (!POLA_EMAIL.test(email)) {
    return NextResponse.json({ error: "Format email pasien belum benar." }, { status: 400 });
  }
  if (emailPmo && !POLA_EMAIL.test(emailPmo)) {
    return NextResponse.json({ error: "Format email PMO belum benar." }, { status: 400 });
  }
  if (!POLA_TANGGAL.test(tanggalMulai) || !POLA_JAM.test(jamMinum)) {
    return NextResponse.json({ error: "Tanggal mulai dan jam minum obat wajib diisi." }, { status: 400 });
  }
  if (!Number.isInteger(durasiHari)) {
    return NextResponse.json({ error: "Durasi pengobatan harus berupa angka hari." }, { status: 400 });
  }

  const { data: pasienId, error } = await supabase.rpc("hubungkan_pasien", {
    p_email: email,
    p_tanggal_mulai: tanggalMulai,
    p_jam_minum: jamMinum,
    p_durasi_hari: durasiHari,
    p_email_pmo: emailPmo || null,
  });

  if (error) {
    // P0001 = pesan dari fungsi database, aman ditampilkan apa adanya
    if (error.code === "P0001") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Gagal menambah pasien. Silakan coba lagi." }, { status: 500 });
  }

  return NextResponse.json({ message: "Pasien berhasil ditambahkan", data: { pasienId } });
}
