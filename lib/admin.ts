import "server-only";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Bramka administratora. KAŻDA strona /admin i KAŻDA akcja admina
 * musi zaczynać się od requireAdmin() — nigdy nie ufamy, że dotarcie
 * pod URL oznacza uprawnienia. Sprawdzenie na podstawie sesji + is_admin()
 * (SECURITY DEFINER), nie na podstawie danych z frontendu.
 *
 * Zwraca klienta z uprawnieniami service role DOPIERO po potwierdzeniu,
 * że zalogowany użytkownik jest adminem.
 */
export async function requireAdmin(): Promise<{
  userId: string;
  email: string | null;
  admin: SupabaseClient;
}> {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) redirect("/");

  return {
    userId: user.id,
    email: user.email ?? null,
    admin: createSupabaseAdmin(),
  };
}

/** Miękkie sprawdzenie (bez redirectu) — np. do warunkowego UI. */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase.rpc("is_admin");
  return data === true;
}
