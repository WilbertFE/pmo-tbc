import { headers } from "next/headers";

// Alamat situs saat ini (localhost saat development, domain Vercel saat production).
// Dipakai untuk URL kembali setelah login Google dan konfirmasi email.
export async function getOriginSaatIni() {
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin;

  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}
