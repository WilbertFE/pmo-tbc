import { NextResponse } from "next/server";
import { getPasienSaya } from "@/lib/auth";
import { getGemini, MODEL_CHAT } from "@/lib/gemini";
import { hitungProgres } from "@/lib/progres";

const MAKS_PESAN = 12;
const MAKS_PANJANG_PESAN = 1000;

const INSTRUKSI = `Kamu adalah asisten edukasi di aplikasi "Pendamping Minum Obat". Penggunanya pasien yang sedang menjalani pengobatan paru jangka panjang (sekitar 6 bulan, minum obat setiap hari) atau PMO (keluarga yang mendampingi minum obat). Banyak pengguna lansia atau tidak terbiasa dengan teknologi.

Tugasmu:
- Menjawab pertanyaan seputar cara minum obat, jadwal, efek samping yang umum, gaya hidup selama pengobatan, dan pentingnya pengobatan sampai tuntas.
- Memberi semangat supaya pasien tidak putus obat.

Aturan:
- Jawab dalam Bahasa Indonesia yang sederhana, ramah, dan singkat (paling banyak sekitar 120 kata). Gunakan kalimat pendek.
- Tulis teks biasa tanpa format markdown: jangan pakai tanda bintang, tanda pagar, atau tabel. Untuk daftar, gunakan baris yang diawali tanda "- ".
- Jangan menyebut nama penyakitnya secara langsung. Sebut "pengobatan Anda" atau "obat yang sedang dijalani", karena layar bisa terlihat orang lain.
- Kamu bukan dokter. Jangan mendiagnosis, jangan menyuruh mengubah dosis, mengganti, atau menghentikan obat. Untuk hal itu, arahkan ke petugas puskesmas.
- Kalau lupa minum obat: minum segera saat ingat di hari yang sama, jangan menggandakan dosis tanpa arahan petugas, dan kabari petugas.
- Air seni, keringat, atau air mata berwarna oranye atau merah adalah efek obat yang umum dan biasanya tidak berbahaya.
- Tanda bahaya yang harus segera dilaporkan ke petugas atau dibawa ke fasilitas kesehatan: mata atau kulit menguning, ruam kulit yang luas, muntah terus-menerus, gangguan penglihatan atau pendengaran, kesemutan berat, sesak napas, atau batuk darah. Untuk keadaan darurat, sarankan menghubungi 119 atau ke IGD terdekat.
- Sarankan pengguna melaporkan keluhan lewat menu "Keluhan" di aplikasi supaya petugas bisa memantau.
- Kalau pertanyaan di luar topik pengobatan dan kesehatan sehari-hari, tolak dengan sopan dan arahkan kembali ke topik.
- Jangan meminta atau menyimpan data pribadi seperti nomor identitas atau alamat.`;

type PesanChat = { peran: "user" | "model"; teks: string };

function bacaPesan(body: unknown): PesanChat[] | null {
  if (!body || typeof body !== "object" || !Array.isArray((body as { pesan?: unknown }).pesan)) return null;
  const daftar = (body as { pesan: unknown[] }).pesan;

  const hasil: PesanChat[] = [];
  for (const p of daftar) {
    if (!p || typeof p !== "object") return null;
    const { peran, teks } = p as { peran?: unknown; teks?: unknown };
    if ((peran !== "user" && peran !== "model") || typeof teks !== "string" || !teks.trim()) return null;
    hasil.push({ peran, teks: teks.slice(0, MAKS_PANJANG_PESAN) });
  }

  // Riwayat dipotong supaya biaya dan waktu tetap kecil; pesan terakhir harus dari pengguna
  const terbaru = hasil.slice(-MAKS_PESAN);
  if (terbaru.length === 0 || terbaru[terbaru.length - 1].peran !== "user") return null;
  return terbaru;
}

// Chatbot edukasi untuk pasien dan PMO. Jawaban dikirim bertahap (stream) sebagai teks biasa.
export async function POST(request: Request) {
  const { pasien } = await getPasienSaya();
  if (!pasien) {
    return NextResponse.json({ error: "Data pengobatan tidak ditemukan." }, { status: 403 });
  }

  const ai = getGemini();
  if (!ai) {
    return NextResponse.json({ error: "Fitur tanya jawab belum diaktifkan." }, { status: 503 });
  }

  const pesan = bacaPesan(await request.json().catch(() => null));
  if (!pesan) {
    return NextResponse.json({ error: "Pesan tidak valid." }, { status: 400 });
  }

  // Konteks ringan tanpa nama atau data pribadi
  const progres = hitungProgres(pasien.tanggal_mulai, pasien.durasi_hari);
  const konteks = `Info pengguna: pengobatan hari ke-${progres.hariKe} dari ${progres.durasiHari}, jadwal minum obat pukul ${pasien.jam_minum.slice(0, 5)} WIB.`;

  try {
    const aliran = await ai.models.generateContentStream({
      model: MODEL_CHAT,
      contents: pesan.map((p) => ({ role: p.peran, parts: [{ text: p.teks }] })),
      config: {
        systemInstruction: `${INSTRUKSI}\n\n${konteks}`,
        maxOutputTokens: 600,
        temperature: 0.4,
      },
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const potongan of aliran) {
            if (potongan.text) controller.enqueue(encoder.encode(potongan.text));
          }
        } catch (error) {
          console.error("Stream Gemini terputus:", error);
          controller.enqueue(encoder.encode("\n\nMaaf, jawaban terputus. Silakan coba lagi."));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Gagal memanggil Gemini:", error);
    return NextResponse.json({ error: "Asisten sedang tidak bisa menjawab. Coba lagi nanti." }, { status: 502 });
  }
}
