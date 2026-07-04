import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js 16: proxy.ts (następca middleware.ts, runtime nodejs).
 * Odświeża sesję Supabase przy każdym żądaniu, żeby Server Components
 * zawsze widziały aktualnego użytkownika.
 */
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Odświeżenie tokenu (nie usuwać — bez tego sesja wygasa w tle).
  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  matcher: [
    // wszystko poza statykami i assetami
    "/((?!_next/static|_next/image|favicon.ico|assets/).*)",
  ],
};
