import { redirect } from "next/navigation";
import { getProfilSaatIni } from "@/lib/auth";
import { DashboardNakesClient } from "./components/DashboardNakesClient";

export const metadata = {
  title: "Dashboard Pemantauan Pasien",
  description: "Sistem pemantauan kepatuhan minum obat harian pasien",
};

export default async function NakesPage() {
  const { profil } = await getProfilSaatIni();

  // Pastikan hanya peran nakes yang dapat mengakses halaman ini
  if (profil.peran !== "nakes") {
    redirect("/pasien");
  }

  return <DashboardNakesClient />;
}
