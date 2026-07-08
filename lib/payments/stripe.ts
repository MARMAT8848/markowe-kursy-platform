import Stripe from "stripe";
import type {
  CreateCheckoutSessionInput,
  CreateCheckoutSessionResult,
  NormalizedPaymentEvent,
  PaymentProvider,
  PaymentProviderName,
} from "./types";

/**
 * StripePaymentProvider — pierwsza implementacja PaymentProvider.
 *
 * Uwagi (PL):
 * - Metody płatności (karty, BLIK, Przelewy24, Apple/Google Pay) zarządzamy
 *   w Stripe Dashboard — celowo NIE ustawiamy payment_method_types, żeby
 *   konfiguracja nie wymagała deployu. BLIK wymaga PLN. P24 może nie być
 *   aktywne dla każdego konta — system działa wtedy na kartach + BLIK +
 *   Apple/Google Pay.
 * - P24 i inne metody z opóźnionym potwierdzeniem wysyłają
 *   checkout.session.async_payment_succeeded / async_payment_failed —
 *   dlatego przy checkout.session.completed aktywujemy dostęp TYLKO gdy
 *   payment_status === 'paid'.
 */

export function stripeConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET
  );
}

let cached: StripePaymentProvider | null = null;

export function getStripeProvider(): StripePaymentProvider {
  if (!cached) cached = new StripePaymentProvider();
  return cached;
}

export class StripePaymentProvider implements PaymentProvider {
  private stripe: Stripe;
  private webhookSecret: string;

  constructor() {
    const key = process.env.STRIPE_SECRET_KEY;
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!key || !secret) {
      throw new Error(
        "Stripe nie jest skonfigurowany - uzupełnij STRIPE_SECRET_KEY i STRIPE_WEBHOOK_SECRET w .env.local"
      );
    }
    this.stripe = new Stripe(key);
    this.webhookSecret = secret;
  }

  getProviderName(): PaymentProviderName {
    return "stripe";
  }

  async createCheckoutSession(
    input: CreateCheckoutSessionInput
  ): Promise<CreateCheckoutSessionResult> {
    const session = await this.stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: input.customerEmail,
      line_items: [
        input.providerPriceId
          ? { price: input.providerPriceId, quantity: 1 }
          : {
              quantity: 1,
              price_data: {
                currency: input.currency.toLowerCase(),
                unit_amount: input.amount,
                product_data: {
                  name: input.courseTitle,
                  description: "Dostęp do kursu online przez 12 miesięcy",
                },
              },
            },
      ],
      metadata: {
        internal_order_id: input.internalOrderId,
        user_id: input.userId,
        course_id: input.courseId,
        access_months: String(input.accessMonths),
        language: input.language,
        source: "markowe_kursy",
      },
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      // TODO (Faza 4): rozważ consent_collection.terms_of_service = 'required'
      // jako DODATKOWE potwierdzenie u operatora (podstawowe zgody zbieramy
      // i zapisujemy sami przed przekierowaniem — /checkout/[slug]).
    });
    if (!session.url) {
      throw new Error("Stripe nie zwrócił adresu checkoutu");
    }
    return {
      checkoutUrl: session.url,
      providerCheckoutSessionId: session.id,
    };
  }

  verifyWebhookSignature(rawBody: string, signatureHeader: string): unknown {
    return this.stripe.webhooks.constructEvent(
      rawBody,
      signatureHeader,
      this.webhookSecret
    );
  }

  normalizePaymentEvent(verifiedEvent: unknown): NormalizedPaymentEvent {
    const event = verifiedEvent as Stripe.Event;
    const base = {
      provider: "stripe" as const,
      providerEventId: event.id,
      rawPayload: event,
    };

    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        const common = {
          ...base,
          providerCheckoutSessionId: s.id,
          providerPaymentIntentId:
            typeof s.payment_intent === "string"
              ? s.payment_intent
              : s.payment_intent?.id,
          providerCustomerId:
            typeof s.customer === "string" ? s.customer : s.customer?.id,
          internalOrderId: s.metadata?.internal_order_id,
          amount: s.amount_total ?? undefined,
          currency: s.currency?.toUpperCase(),
          customerEmail: s.customer_details?.email ?? undefined,
        };
        // Aktywacja tylko przy potwierdzonej płatności; metody asynchroniczne
        // (np. P24) dokończą się eventem async_payment_succeeded.
        if (s.payment_status === "paid") {
          return { ...common, type: "payment_succeeded", paidAt: new Date() };
        }
        return { ...common, type: "ignored" };
      }

      case "checkout.session.async_payment_succeeded": {
        const s = event.data.object as Stripe.Checkout.Session;
        return {
          ...base,
          type: "payment_succeeded",
          providerCheckoutSessionId: s.id,
          providerPaymentIntentId:
            typeof s.payment_intent === "string"
              ? s.payment_intent
              : s.payment_intent?.id,
          internalOrderId: s.metadata?.internal_order_id,
          amount: s.amount_total ?? undefined,
          currency: s.currency?.toUpperCase(),
          customerEmail: s.customer_details?.email ?? undefined,
          paidAt: new Date(),
        };
      }

      case "checkout.session.async_payment_failed": {
        const s = event.data.object as Stripe.Checkout.Session;
        return {
          ...base,
          type: "payment_failed",
          providerCheckoutSessionId: s.id,
          internalOrderId: s.metadata?.internal_order_id,
        };
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        return {
          ...base,
          type: "payment_failed",
          providerPaymentIntentId: pi.id,
          internalOrderId: pi.metadata?.internal_order_id,
        };
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const fullyRefunded =
          charge.amount_refunded >= (charge.amount_captured || charge.amount);
        return {
          ...base,
          type: fullyRefunded ? "refund_full" : "refund_partial",
          providerPaymentIntentId:
            typeof charge.payment_intent === "string"
              ? charge.payment_intent
              : charge.payment_intent?.id,
          amount: charge.amount_refunded,
          currency: charge.currency?.toUpperCase(),
        };
      }

      default:
        return { ...base, type: "ignored" };
    }
  }

  async handleWebhook(
    rawBody: string,
    signatureHeader: string
  ): Promise<NormalizedPaymentEvent> {
    const verified = this.verifyWebhookSignature(rawBody, signatureHeader);
    return this.normalizePaymentEvent(verified);
  }

  async refundPayment(
    providerPaymentId: string,
    amount?: number
  ): Promise<void> {
    await this.stripe.refunds.create({
      payment_intent: providerPaymentId,
      ...(amount ? { amount } : {}),
    });
  }
}
