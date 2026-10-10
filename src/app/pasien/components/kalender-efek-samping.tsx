import { cn } from "@/lib/utils";
import type { TingkatEfekSamping } from "@/lib/supabase/database.types";
import { tanggalWIB } from "@/lib/tanggal";

type EfekSampingData = {
  created_at: string | null;
  tingkat: TingkatEfekSamping;
};

type KalenderEfekSampingProps = {
  efekSampingList: EfekSampingData[];
  bulan: number; // 0-11
  tahun: number;
};

const NAMA_HARI = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const NAMA_BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function tingkatTertinggi(levels: TingkatEfekSamping[]): TingkatEfekSamping | null {
  if (levels.includes("berat")) return "berat";
  if (levels.includes("sedang")) return "sedang";
  if (levels.includes("ringan")) return "ringan";
  return null;
}

function warnaTingkat(tingkat: TingkatEfekSamping) {
  switch (tingkat) {
    case "ringan": return "bg-emerald-500";
    case "sedang": return "bg-amber-500";
    case "berat": return "bg-red-500";
  }
}

export default function KalenderEfekSamping({
  efekSampingList,
  bulan,
  tahun,
}: KalenderEfekSampingProps) {
  // Map dari tanggal "YYYY-MM-DD" ke array tingkat
  const reportMap = new Map<string, TingkatEfekSamping[]>();
  
  efekSampingList.forEach(es => {
    if (es.created_at) {
      // created_at diubah jadi format tanggal WIB
      const tgl = tanggalWIB(new Date(es.created_at));
      const arr = reportMap.get(tgl) || [];
      arr.push(es.tingkat);
      reportMap.set(tgl, arr);
    }
  });

  const tanggalSatu = new Date(tahun, bulan, 1);
  const hariPertama = tanggalSatu.getDay();
  // Konversi ke format Sen=0 (ISO): (hariPertama + 6) % 7
  const offsetAwal = (hariPertama + 6) % 7;
  const jumlahHari = new Date(tahun, bulan + 1, 0).getDate();

  const selKalender: { tanggal: string, tingkat: TingkatEfekSamping | null }[] = [];
  
  // Fill empty spaces before 1st day
  for (let i = 0; i < offsetAwal; i++) {
    selKalender.push({ tanggal: "", tingkat: null });
  }
  
  // Fill days of the month
  for (let d = 1; d <= jumlahHari; d++) {
    const tglStr = `${tahun}-${String(bulan + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const tkts = reportMap.get(tglStr) || [];
    selKalender.push({ 
      tanggal: tglStr, 
      tingkat: tingkatTertinggi(tkts) 
    });
  }

  return (
    <div className="w-full">
      <h3 className="text-sm font-semibold mb-4 text-center">
        Kalender Keluhan {NAMA_BULAN[bulan]} {tahun}
      </h3>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {NAMA_HARI.map((h) => (
          <div key={h} className="text-center text-xs text-muted-foreground font-medium pb-2">
            {h}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {selKalender.map((sel, i) => {
          if (!sel.tanggal) {
            return <div key={`empty-${i}`} className="aspect-square" />;
          }
          
          const d = parseInt(sel.tanggal.split("-")[2], 10);
          const hasReport = sel.tingkat !== null;
          
          return (
            <div
              key={sel.tanggal}
              className={cn(
                "aspect-square flex flex-col items-center justify-center gap-1 rounded-md transition-colors",
                hasReport ? "bg-muted/50 border border-border" : "hover:bg-accent/50"
              )}
            >
              <span className={cn(
                "text-sm font-medium",
                hasReport ? "text-foreground" : "text-muted-foreground"
              )}>
                {d}
              </span>
              {hasReport && (
                <div className={cn("w-2 h-2 rounded-full", warnaTingkat(sel.tingkat as TingkatEfekSamping))} />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-4 mt-6 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-xs text-muted-foreground">Ringan</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="text-xs text-muted-foreground">Sedang</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span className="text-xs text-muted-foreground">Berat</span>
        </div>
      </div>
    </div>
  );
}
