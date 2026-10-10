import { Card, CardContent } from "@/components/ui/card";
import { tambahHari } from "@/lib/tanggal";

type RingkasanPengobatanProps = {
  tanggalMulai: string;
  durasiHari: number;
  jamMinum: string;
  hariKe: number;
  persen: number;
  selesai: boolean;
  belumMulai: boolean;
  namaNakes?: string;
};

function formatTanggalPanjang(tanggal: string): string {
  const d = new Date(tanggal + "T00:00:00");
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function hitungFase(hariKe: number, durasiHari: number): string {
  // Fase intensif: 2 bulan pertama (sekitar 56 hari)
  // Fase lanjutan: sisa pengobatan
  if (hariKe <= 56) return "Fase Intensif";
  return "Fase Lanjutan";
}

export default function RingkasanPengobatan({
  tanggalMulai,
  durasiHari,
  jamMinum,
  hariKe,
  persen,
  selesai,
  belumMulai,
  namaNakes,
}: RingkasanPengobatanProps) {
  const tanggalSelesai = tambahHari(tanggalMulai, durasiHari - 1);
  const fase = hitungFase(hariKe, durasiHari);

  return (
    <div className="flex flex-col gap-4">
      {/* Ringkasan Pengobatan Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
                />
              </svg>
              <span className="text-sm font-semibold text-emerald-700">
                Ringkasan Pengobatan
              </span>
            </div>

            {/* Judul Program */}
            <div>
              <h3 className="text-lg font-bold leading-tight">
                Program Pemulihan Berkelanjutan
              </h3>
              <span className="mt-1 inline-block rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {fase}
              </span>
            </div>

            {/* Tanggal */}
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                  <svg
                    className="h-4 w-4 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 9v9.75"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-700">
                    Tanggal Mulai: {formatTanggalPanjang(tanggalMulai)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Mulai pukul {jamMinum.slice(0, 5)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100">
                  <svg
                    className="h-4 w-4 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 9v9.75"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-red-700">
                    Target Selesai: {formatTanggalPanjang(tanggalSelesai)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Sampai pukul 23:59
                  </p>
                </div>
              </div>
            </div>

            {/* Separator */}
            <div className="border-t border-border" />

            {/* Info Pengobatan */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Durasi Pengobatan</span>
                <span className="font-semibold">{durasiHari} Hari</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Jam Minum Obat</span>
                <span className="font-semibold">{jamMinum.slice(0, 5)} WIB</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-semibold text-emerald-600">
                  {belumMulai
                    ? "Belum dimulai"
                    : selesai
                      ? "Selesai"
                      : `Hari ke-${hariKe} (${persen}%)`}
                </span>
              </div>
            </div>

            {/* Separator */}
            <div className="border-t border-border" />

            {/* Status Terhubung */}
            <div className="flex items-start gap-2">
              <svg
                className="mt-0.5 h-5 w-5 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.745 3.745 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"
                />
              </svg>
              <div>
                <p className="text-sm font-semibold text-emerald-700">
                  Terhubung dengan Nakes
                </p>
                <p className="text-xs text-muted-foreground">
                  Laporan kamu langsung dipantau oleh tenaga kesehatan.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
