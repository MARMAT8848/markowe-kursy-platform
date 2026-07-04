import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Klient Supabase dla Server Components / Route Handlers —
 * działa w kontekście zalogowanego użytkownika (RLS aktywne).
 * user_id NIGDY z frontendu — zawsze z sesji (auth.getUser()).
 */
export async function createSupabaseServer() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // wywołanie z Server Component — sesję odświeża proxy.ts
          }
        },
      },
    }
  );
}

/** Zalogowany użytkownik z sesji (null, gdy brak). */
export async function getSessionUser() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
