"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";

interface FilterPasienProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterStatus: string;
  onFilterChange: (status: string) => void;
  jumlahPasienFiltered: number;
}

export function FilterPasien({
  searchQuery,
  onSearchChange,
  filterStatus,
  onFilterChange,
  jumlahPasienFiltered,
}: FilterPasienProps) {
  const opsiFilter = [
    { id: "semua", label: "Semua Pasien" },
    { id: "merah", label: "Perhatian Segera (Merah)" },
    { id: "kuning", label: "Perlu Pemantauan (Kuning)" },
    { id: "hijau", label: "Terkendali (Hijau)" },
    { id: "menunggu", label: "Menunggu Verifikasi" },
  ];

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-muted/30 p-3 rounded-xl border">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Cari nama pasien atau PMO..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-background h-9 text-sm"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
        <div className="flex items-center text-xs text-muted-foreground mr-1 shrink-0">
          <Filter className="size-3.5 mr-1" />
          Filter:
        </div>
        {opsiFilter.map((tab) => {
          const aktif = filterStatus === tab.id;
          return (
            <Button
              key={tab.id}
              variant={aktif ? "default" : "outline"}
              size="xs"
              onClick={() => onFilterChange(tab.id)}
              className="text-xs shrink-0 rounded-full"
            >
              {tab.label}
            </Button>
          );
        })}
      </div>

      {/* Info hasil */}
      <div className="text-xs text-muted-foreground shrink-0 self-center md:self-auto">
        Menampilkan <span className="font-semibold text-foreground">{jumlahPasienFiltered}</span> pasien
      </div>
    </div>
  );
}
