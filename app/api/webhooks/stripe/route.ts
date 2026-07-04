import { NextResponse } from "next/server";
import { getStripeProvider, stripeConfigured } from "@/lib/payments/stripe";

/**
 * POST /api/webhooks/stripe
 *
 * JEDYNE miejsce aktywacji dostępu do kursu (nigdy /checkout/success).
 * Wymogi: weryfikacja podpisu surowego body, idempotencja po
 * provider_event_id (unique w payment_provider_events), obsługa płatności
 * asynchronicznych (P24) i zwrotów.
 */
export async function POST(req: Request) {
  if (!stripeConfigured()) {
    return NextResponse.json(
      { error: "PLATFORM_NOT_CONFIGURED" },
      { status: 503 }
    );
  }

  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature") ?? "";

  let event;
  try {
    event = await getStripeProvider().handleWebhook(rawBody, signature);
  } catch {
    // Nieprawidłowy podpis — odrzucamy bez przetwarzania.
    return NextResponse.json({ error: "INVALID_SIGNATURE" }, { status: 400 });
  }

  // TODO (Faza 4 — Supabase, service role — wyłącznie po stronie serwera):
  //  1. INSERT payment_provider_events (provider, provider_event_id, ...)
  //     ON CONFLICT DO NOTHING → jeśli konflikt, event już przetworzony:
  //     zwróć 200 i ZAKOŃCZ (idempotencja — duplikat nie tworzy enrollmentu).
  //  2. Zweryfikuj internal_order_id z metadata względem orders w bazie
  //     (nie ufamy samym metadata).
  //  3. payment_succeeded:
  //     - orders.status = 'paid', INSERT payments (paid_at),
  //     - INSERT enrollments: status='active',
  //       access_start_at = paid_at,
  //       access_expires_at = paid_at + 12 miesięcy,
  //       (unique constraint chroni przed duplikatem),
  //     - kolejkuj e-mail 'purchase_confirmation' (email_outbox) z:
  //       nazwą kursu, ceną, walutą, datą zakupu, okresem dostępu 12 mies.,
  //       potwierdzeniem zgody na natychmiastowe dostarczenie treści cyfrowej
  //       i przyjęcia do wiadomości utraty prawa odstąpienia oraz linkami do
  //       /regulamin, /polityka-prywatnosci, /zwroty-i-reklamacje.
  //  4. payment_failed: orders.status = 'failed'.
  //  5. refund_full: payments.status='refunded', enrollments.status='revoked'
  //     (revoked_reason='refund'); certyfikat wydany dla tego enrollmentu →
  //     status 'revoked'. refund_partial: bez automatycznej zmiany dostępu.
  //  6. Oznacz event jako 'processed' / 'ignored' / 'failed'.
  console.log("[stripe webhook]", event.type, event.providerEventId);

  return NextResponse.json({ received: true });
}
