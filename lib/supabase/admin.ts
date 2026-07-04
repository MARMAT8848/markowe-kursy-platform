import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Klient administracyjny (secret/service key) — OMIJA RLS.
 * Wyłącznie po stronie serwera: webhooki, zapis zamówień ze zgodami,
 * enrollmenty, certyfikaty, e-maile. Import w kodzie klienckim
 * zablokowany przez pakiet "server-only".
 */
export function createSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
