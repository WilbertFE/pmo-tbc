import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

// Client untuk Client Components ("use client"): upload media ke Storage dan Realtime.
// CRUD biasa tetap lewat API route di src/app/api/.
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
