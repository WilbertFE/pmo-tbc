import type { Metadata } from "next";
import ChatEdukasi from "../components/chat-edukasi";

export const metadata: Metadata = {
  title: "Tanya Obat",
};

export default function TanyaPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 pt-6">
      <div>
        <h1 className="text-2xl font-semibold">Tanya Seputar Obat</h1>
        <p className="text-muted-foreground">
          Jawaban dari asisten AI, bukan pengganti petugas kesehatan. Untuk keluhan berat, segera hubungi
          puskesmas.
        </p>
      </div>
      <ChatEdukasi />
    </main>
  );
}
