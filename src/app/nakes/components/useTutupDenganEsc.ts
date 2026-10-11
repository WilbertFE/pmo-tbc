"use client";

import { useEffect } from "react";

// Tutup modal saat tombol Escape ditekan
export function useTutupDenganEsc(onClose: () => void) {
  useEffect(() => {
    const tangani = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", tangani);
    return () => window.removeEventListener("keydown", tangani);
  }, [onClose]);
}
