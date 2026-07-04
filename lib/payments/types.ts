/**
 * Warstwa abstrakcji płatności — provider-agnostic.
 *
 * Logika biznesowa (orders, payments, enrollments) NIE zależy od Stripe.
 * Każdy operator (Stripe, Paddle, Lemon Squeezy, PayU, Przelewy24 native)
 * implementuje ten interfejs; webhooki są normalizowane do NormalizedPaymentEvent.
 *
 * Zmiana na Merchant of Record w przyszłości = nowy provider + webhooki,
 * bez zmian w logice kursów i enrollmentów.
 */

export type PaymentProviderName =
  | "stripe"
  | "paddle"
  | "lemonsqueezy"
  | "payu"
  | "p24";

export type SupportedCurrency = "PLN" | "EUR" | "NOK" | "GBP" | "USD";

export interface CreateCheckoutSessionInput {
  /** Wewnętrzne ID zamówienia (orders.id) — jedyne wiążące odniesienie. */
  internalOrderId: string;
  userId: string;
  courseId: string;
  /** Cena z course_prices — nigdy z frontendu. Kwota w jednostkach minor (grosze). */
  providerPriceId: string;
  amount: number;
  currency: SupportedCurrency;
  customerEmail: string;
  /** Długość dostępu zapisywana w metadata — domyślnie 12. */
  accessMonths: number;
  language: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CreateCheckoutSessionResult {
  /** URL przekierowania do zewnętrznego checkoutu. */
  checkoutUrl: string;
  providerCheckoutSessionId: string;
}

/**
 * Znormalizowany event płatności — wspólny format dla wszystkich operatorów.
 * Webhook handler operuje wyłącznie na tym typie.
 */
export type NormalizedPaymentEventType =
  /** Płatność potwierdzona (sync lub async, np. P24) → aktywuj enrollment. */
  | "payment_succeeded"
  /** Płatność nieudana / porzucona. */
  | "payment_failed"
  /** Pełny zwrot → polityka: revoke enrollment. */
  | "refund_full"
  /** Częściowy zwrot → bez automatycznej zmiany dostępu. */
  | "refund_partial"
  /** Event nieistotny dla logiki biznesowej → status 'ignored'. */
  | "ignored";

export interface NormalizedPaymentEvent {
  type: NormalizedPaymentEventType;
  provider: PaymentProviderName;
  /** Unikalne ID eventu u operatora — klucz idempotencji (payment_provider_events). */
  providerEventId: string;
  providerCheckoutSessionId?: string;
  providerPaymentIntentId?: string;
  providerCustomerId?: string;
  /** metadata.internal_order_id — MUSI być zweryfikowane z orders w bazie. */
  internalOrderId?: string;
  amount?: number;
  currency?: string;
  customerEmail?: string;
  paidAt?: Date;
  taxAmount?: number;
  providerTaxDetails?: unknown;
  /** Surowy payload do zapisania w payment_provider_events.raw_payload. */
  rawPayload: unknown;
}

export interface PaymentProvider {
  getProviderName(): PaymentProviderName;

  createCheckoutSession(
    input: CreateCheckoutSessionInput
  ): Promise<CreateCheckoutSessionResult>;

  /**
   * Weryfikacja podpisu surowego body webhooka.
   * Rzuca błąd przy nieprawidłowym podpisie — handler zwraca wtedy 400.
   */
  verifyWebhookSignature(rawBody: string, signatureHeader: string): unknown;

  /**
   * Normalizacja zweryfikowanego eventu operatora do wspólnego formatu.
   */
  normalizePaymentEvent(verifiedEvent: unknown): NormalizedPaymentEvent;

  /**
   * Pełna obsługa webhooka: verify → normalize.
   * Zapis do payment_provider_events i logika biznesowa dzieją się poza providerem.
   */
  handleWebhook(
    rawBody: string,
    signatureHeader: string
  ): Promise<NormalizedPaymentEvent>;

  refundPayment(providerPaymentId: string, amount?: number): Promise<void>;

  /** Opcjonalne — portal klienta, jeśli operator go oferuje. */
  getCustomerPortalUrl?(providerCustomerId: string): Promise<string>;
}
