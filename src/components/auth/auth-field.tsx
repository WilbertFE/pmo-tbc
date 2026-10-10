"use client";

import { useState, type ComponentProps } from "react";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type AuthFieldProps = Omit<ComponentProps<"input">, "id"> & {
  id: string;
  label: string;
  ikon: LucideIcon;
  error?: string;
};

// Input bergaya desain Figma: label di atas, ikon di kiri, latar abu, radius 12px.
// Untuk type="password" otomatis ada tombol lihat/sembunyikan sandi.
export function AuthField({ id, label, ikon: Ikon, error, type, className, ...props }: AuthFieldProps) {
  const [tampilkan, setTampilkan] = useState(false);
  const isSandi = type === "password";
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="text-base leading-5 font-normal text-foreground">
        {label}
      </Label>
      <div className="relative">
        <Ikon
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-[18px] size-5 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          id={id}
          type={isSandi && tampilkan ? "text" : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "h-11 border-transparent bg-muted pl-[46px] text-base shadow-none md:text-base dark:bg-input/30",
            isSandi && "pr-12",
            className,
          )}
          {...props}
        />
        {isSandi && (
          <button
            type="button"
            onClick={() => setTampilkan((v) => !v)}
            aria-label={tampilkan ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
            aria-pressed={tampilkan}
            className="absolute top-1/2 right-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            {tampilkan ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
          </button>
        )}
      </div>
      {error && (
        <p id={errorId} className="text-sm leading-5 text-[#b3261e]">
          {error}
        </p>
      )}
    </div>
  );
}
