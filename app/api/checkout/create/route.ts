import { NextResponse } from "next/server";
import { getCourse, isPurchasable } from "@/lib/courses";
import {
  allConsentsGiven,
  buildOrderConsentColumns,
  type ConsentFlags,
} from "@/lib/legal/consents";
import { stripeConfigured, getStripeProvider } from "@/lib/payments/stripe";

/**
 * POST /api/checkout/create
 *
 * Twarde reguły (wymogi prawne właściciela):
 * 1. Zakup NIE przechodzi bez kompletu 4 zgód — walidacja tutaj,
 *    niezależnie od blokady przycisku na froncie.
 * 2. Zgody + wersje dokumentów + IP + user-agent + pełny snapshot
 *    trafiają do orders (insert w Fazie 2, struktura budowana już teraz).
 * 3. Dostęp do kursu aktywuje WYŁĄCZNIE webhook operatora płatności
 *    (/api/webhooks/stripe) — nigdy powrót na /checkout/success.
 */
export async function POST(req: Request) {
  let body: { courseSlug?: string; consents?: Partial<ConsentFlags> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "BAD_REQUEST", message: "Nieprawidłowe żądanie." },
      { status: 400 }
    );
  }

  const course = body.courseSlug ? getCourse(body.courseSlug) : undefined;
  if (!course) {
    return NextResponse.json(
      { error: "COURSE_NOT_FOUND", message: "Kurs nie istnieje." },
      { status: 404 }
    );
  }
  if (!isPurchasable(course)) {
    return NextResponse.json(
      {
        error: "COURSE_NOT_PURCHASABLE",
        message: "Ten kurs nie jest jeszcze dostępny w sprzedaży.",
      },
      { status: 409 }
    );
  }

  // --- walidacja zgód server-side (nigdy nie ufamy frontendowi) ---
  if (!allConsentsGiven(body.consents)) {
    return NextResponse.json(
      {
        error: "CONSENTS_REQUIRED",
        message:
          "Zakup wymaga zaznaczenia wszystkich czterech zgód. Wróć i zaznacz brakujące oświadczenia.",
      },
      { status: 422 }
    );
  }

  // --- dane dowodowe zgody: IP + user-agent + snapshot treści i wersji ---
  const userIp =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    null;
  const userAgent = req.headers.get("user-agent") || null;
  const consentColumns = buildOrderConsentColumns({
    acceptedAt: new Date(),
    userIp,
    userAgent,
  });

  // TODO (Faza 2 — Supabase):
  //   1. Pobierz usera z sesji (auth.uid) — user_id NIGDY z frontendu;
  //      brak sesji → 401 i redirect na /login.
  //   2. INSERT do orders: user_id, course_id, provider='stripe',
  //      status='pending', amount=course.priceCents, currency,
  //      ...consentColumns  ← zapis wszystkich zgód wraz ze snapshotem.
  // TODO (Faza 4 — Stripe):
  //   3. provider.createCheckoutSession({ internalOrderId, ... })
  //   4. UPDATE orders SET provider_checkout_session_id
  //   5. return { checkoutUrl }

  if (!stripeConfigured()) {
    console.log(
      "[checkout] zgody zebrane i zwalidowane (oczekuje na Supabase/Stripe):",
      JSON.stringify({
        course: course.slug,
        snapshot: consentColumns.checkout_legal_snapshot_json,
      })
    );
    return NextResponse.json(
      {
        error: "PLATFORM_NOT_CONFIGURED",
        message:
          "Zgody zostały przyjęte, ale płatności nie są jeszcze uruchomione — platforma czeka na podłączenie operatora płatności. Spróbuj po starcie sprzedaży.",
      },
      { status: 503 }
    );
  }

  // Ta gałąź zostanie dokończona w Fazie 4 (wymaga orders w Supabase,
  // aby internalOrderId był prawdziwym ID zamówienia z zapisanymi zgodami).
  void getStripeProvider;
  return NextResponse.json(
    {
      error: "NOT_IMPLEMENTED",
      message:
        "Płatności zostaną włączone po podłączeniu bazy danych (Faza 2/4).",
    },
    { status: 503 }
  );
}
