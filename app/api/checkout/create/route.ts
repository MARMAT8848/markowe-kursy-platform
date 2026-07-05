import { NextResponse } from "next/server";
import { getCourse, isPurchasable } from "@/lib/courses";
import {
  allConsentsGiven,
  buildOrderConsentColumns,
  type ConsentFlags,
} from "@/lib/legal/consents";
import { stripeConfigured, getStripeProvider } from "@/lib/payments/stripe";
import { createSupabaseServer } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { getUserCourseStates } from "@/lib/enrollment-state";

/**
 * POST /api/checkout/create
 *
 * Twarde reguły (wymogi prawne właściciela):
 * 1. Zakup wymaga zalogowania — user_id WYŁĄCZNIE z sesji.
 * 2. Zakup NIE przechodzi bez kompletu 4 zgód (walidacja server-side).
 * 3. Zgody + wersje dokumentów + IP + user-agent + snapshot → orders.
 * 4. Dostęp aktywuje WYŁĄCZNIE webhook operatora (nigdy /checkout/success).
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

  // --- 1. użytkownik z sesji ---
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      {
        error: "AUTH_REQUIRED",
        message: "Zaloguj się, aby kupić kurs.",
      },
      { status: 401 }
    );
  }

  // --- 1b. blokada podwójnego zakupu aktywnego kursu (server-side) ---
  const states = await getUserCourseStates();
  if (states[course.slug] === "active") {
    return NextResponse.json(
      {
        error: "ALREADY_OWNED",
        message: "Masz już aktywny dostęp do tego kursu.",
      },
      { status: 409 }
    );
  }

  // --- 2. walidacja zgód (nigdy nie ufamy frontendowi) ---
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

  if (!stripeConfigured()) {
    return NextResponse.json(
      {
        error: "PAYMENTS_NOT_CONFIGURED",
        message:
          "Płatności nie są jeszcze uruchomione — sklep wystartuje wkrótce.",
      },
      { status: 503 }
    );
  }

  // --- 3. kurs i cena z bazy (nigdy z frontendu) ---
  const admin = createSupabaseAdmin();
  const { data: dbCourse, error: courseErr } = await admin
    .from("courses")
    .select("id, status")
    .eq("slug", course.slug)
    .maybeSingle();
  if (courseErr || !dbCourse || dbCourse.status !== "published") {
    return NextResponse.json(
      {
        error: "DB_NOT_READY",
        message: "Sklep jest w trakcie konfiguracji. Spróbuj później.",
      },
      { status: 503 }
    );
  }
  const { data: price } = await admin
    .from("course_prices")
    .select("id, provider_price_id, currency, amount")
    .eq("course_id", dbCourse.id)
    .eq("currency", "PLN")
    .eq("active", true)
    .limit(1)
    .maybeSingle();
  if (!price) {
    return NextResponse.json(
      { error: "PRICE_NOT_FOUND", message: "Brak aktywnej ceny kursu." },
      { status: 503 }
    );
  }

  // --- 4. zamówienie pending + PEŁNY zapis zgód (dowód prawny) ---
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

  const { data: order, error: orderErr } = await admin
    .from("orders")
    .insert({
      user_id: user.id,
      course_id: dbCourse.id,
      provider: "stripe",
      status: "pending",
      amount: price.amount,
      currency: price.currency,
      customer_email: user.email,
      ...consentColumns,
    })
    .select("id")
    .single();
  if (orderErr || !order) {
    console.error("[checkout] order insert failed:", orderErr?.message);
    return NextResponse.json(
      { error: "ORDER_FAILED", message: "Nie udało się utworzyć zamówienia." },
      { status: 500 }
    );
  }

  // --- 5. sesja płatności u operatora ---
  const site = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
  try {
    const session = await getStripeProvider().createCheckoutSession({
      internalOrderId: order.id,
      userId: user.id,
      courseId: dbCourse.id,
      courseTitle: course.title,
      providerPriceId: price.provider_price_id ?? undefined,
      amount: price.amount,
      currency: price.currency as "PLN",
      customerEmail: user.email ?? "",
      accessMonths: 12,
      language: "pl",
      successUrl: `${site}/checkout/success`,
      cancelUrl: `${site}/checkout/cancel`,
    });
    await admin
      .from("orders")
      .update({ provider_checkout_session_id: session.providerCheckoutSessionId })
      .eq("id", order.id);
    return NextResponse.json({ checkoutUrl: session.checkoutUrl });
  } catch (e) {
    console.error("[checkout] stripe session failed:", e);
    await admin
      .from("orders")
      .update({ status: "failed" })
      .eq("id", order.id);
    return NextResponse.json(
      {
        error: "PROVIDER_ERROR",
        message: "Operator płatności nie odpowiada. Spróbuj za chwilę.",
      },
      { status: 502 }
    );
  }
}
