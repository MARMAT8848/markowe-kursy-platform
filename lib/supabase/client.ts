"use client";

import { createBrowserClient } from "@supabase/ssr";

/** Klient Supabase dla komponentów klienckich (klucz publiczny, RLS). */
export function createSupabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
