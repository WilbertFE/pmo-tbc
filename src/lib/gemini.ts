import { GoogleGenAI } from "@google/genai";

// Hanya untuk kode server (API route). Kunci tidak boleh sampai ke browser.
// Model cepat dan hemat untuk chat; ganti di sini kalau perlu model lain.
export const MODEL_CHAT = "gemini-3.5-flash-lite";

let client: GoogleGenAI | null = null;

// Mengembalikan null kalau GEMINI_API_KEY belum diisi, supaya API route bisa memberi pesan yang jelas
export function getGemini(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  client ??= new GoogleGenAI({ apiKey });
  return client;
}
