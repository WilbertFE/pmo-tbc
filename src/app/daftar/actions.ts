"use server";

import { redirect } from "next/navigation";
import { getOriginSaatIni } from "@/lib/origin";
import { createClient } from "@/lib/supabase/server";

type FieldDaftar = "nama" | "email" | "password" | "konfirmasi";

export type DaftarState =
  | {
      error?: string;
      errorField?: Partial<Record<FieldDaftar, string>>;
      sukses?: string;
    }
  | undefined;

const POLA_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_SANDI = 8;

// Pendaftaran mandiri selalu menjadi peran pasien (diatur trigger buat_profil_baru).
// Peran nakes atau PMO hanya bisa diberikan admin lewat app_metadata.
export async function daftar(_state: DaftarState, formData: FormData): Promise<DaftarState> {
  const nama = String(formData.get("nama") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const konfirmasi = String(formData.get("konfirmasi") ?? "");

  const errorField: Partial<Record<FieldDaftar, string>> = {};
  if (nama.length < 2) errorField.nama = "Masukkan nama lengkap Anda.";
  if (!POLA_EMAIL.test(email)) errorField.email = "Format email belum benar.";
  if (password.length < MIN_SANDI) errorField.password = `Kata sandi minimal ${MIN_SANDI} karakter.`;
  if (konfirmasi !== password) errorField.konfirmasi = "Konfirmasi kata sandi tidak sama.";

  if (Object.keys(errorField).length > 0) {
    return { errorField };
  }

  const supabase = await createClient();
  const origin = await getOriginSaatIni();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nama },
      emailRedirectTo: `${origin}/api/auth/callback`,
    },
  });

  if (error) {
    switch (error.code) {
      case "user_already_exists":
      case "email_exists":
        return { errorField: { email: "Email ini sudah terdaftar. Silakan masuk." } };
      case "weak_password":
        return { errorField: { password: "Kata sandi terlalu lemah. Gunakan kombinasi huruf dan angka." } };
      case "over_email_send_rate_limit":
      case "over_request_rate_limit":
        return { error: "Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi." };
      default:
        return { error: "Pendaftaran gagal. Silakan coba lagi." };
    }
  }

  // Jika "Confirm email" aktif dan email sudah terdaftar, Supabase mengembalikan user tanpa identitas
  if (data.user && data.user.identities?.length === 0) {
    return { errorField: { email: "Email ini sudah terdaftar. Silakan masuk." } };
  }

  // Konfirmasi email nonaktif: langsung punya session
  if (data.session) {
    redirect("/menunggu-verifikasi");
  }

  return {
    sukses: `Hampir selesai. Kami sudah mengirim tautan konfirmasi ke ${email}. Buka email tersebut untuk mengaktifkan akun.`,
  };
}
