import type { TingkatEfekSamping } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";

type EfekSampingItem = {
  id: string;
  jenis: string;
  tingkat: TingkatEfekSamping;
  catatan: string | null;
  created_at: string | null;
};

type RiwayatEfekSampingProps = {
  daftar: EfekSampingItem[];
};

function badgeTingkat(tingkat: TingkatEfekSamping) {
  switch (tingkat) {
    case "ringan":
      return "bg-emerald-100 text-emerald-700";
    case "sedang":
      return "bg-amber-100 text-amber-700";
    case "berat":
      return "bg-red-100 text-red-700";
  }
}

function labelTingkat(tingkat: TingkatEfekSamping) {
  switch (tingkat) {
    case "ringan":
      return "Ringan";
    case "sedang":
      return "Sedang";
    case "berat":
      return "Berat";
  }
}

function formatTanggalPendek(isoString: string | null): string {
  if (!isoString) return "";
  const d = new Date(isoString);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Jakarta",
  });
}

export default function RiwayatEfekSamping({ daftar }: RiwayatEfekSampingProps) {
  if (daftar.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Belum ada laporan efek samping.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {daftar.map((es) => (
        <li
          key={es.id}
          className="flex items-start gap-3 rounded-lg border border-border bg-card p-3"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium">{es.jenis}</span>
              <span
                className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full",
                  badgeTingkat(es.tingkat)
                )}
              >
                {labelTingkat(es.tingkat)}
              </span>
            </div>
            {es.catatan && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {es.catatan}
              </p>
            )}
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
            {formatTanggalPendek(es.created_at)}
          </span>
        </li>
      ))}
    </ul>
  );
}
