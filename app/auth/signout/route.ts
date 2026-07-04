import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

/** POST /auth/signout — wylogowanie i powrót na stronę główną. */
export async function POST(req: Request) {
  const supabase = await createSupabaseServer();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", new URL(req.url).origin), {
    status: 303,
  });
}
