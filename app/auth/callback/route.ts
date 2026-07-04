import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

/**
 * GET /auth/callback?code=...
 * Powrót z linku potwierdzającego e-mail (PKCE): wymiana kodu na sesję
 * i przekierowanie do panelu (lub na ?next=).
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/dashboard";

  if (code) {
    const supabase = await createSupabaseServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, url.origin));
    }
  }
  return NextResponse.redirect(
    new URL("/login?error=confirmation", url.origin)
  );
}
