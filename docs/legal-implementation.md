# Wdrożenie prawne — stan i zasady (Markowe Kursy)

## Zrobione (Faza 1)

- **Strony dokumentów** (treść dosłownie od właściciela, wersja 1.0):
  `/regulamin`, `/polityka-prywatnosci`, `/polityka-cookies`, `/zwroty-i-reklamacje`
  (treści w `lib/legal/*.ts`, renderer `components/LegalDoc.tsx`).
- **Checkout ze zgodami** `/checkout/[slug]`: 4 osobne checkboxy, żaden
  domyślnie zaznaczony, przycisk płatności zablokowany bez kompletu
  (`components/checkout/CheckoutConsents.tsx`).
- **Walidacja server-side** w `POST /api/checkout/create` — 422 przy braku
  którejkolwiek zgody, niezależnie od frontendu; zbierane IP + user-agent;
  budowany pełny snapshot (`lib/legal/consents.ts` →
  `buildOrderConsentColumns`, `buildLegalSnapshot`).
- **Schemat bazy**: kolumny zgód w `orders`
  (`supabase/migrations/0001_init.sql`): terms/privacy/refund/digital_content/
  withdrawal + wersje dokumentów + user_ip + user_agent +
  `checkout_legal_snapshot_json`.
- **Stopka** z linkami do dokumentów na wszystkich stronach (wymóg dostępności
  dokumentów + wymóg Stripe).
- Kursy `coming_soon` **nie są kupowalne** (`/api/checkout/create` → 409,
  `/checkout/[slug]` → redirect na stronę kursu).

## Do dokończenia (wymaga Supabase — Faza 2, i Stripe — Faza 4)

- INSERT zamówienia ze zgodami do `orders` (struktura payloadu gotowa).
- Wymóg zalogowania przed checkout (user z sesji, nigdy z frontendu).
- Aktywacja dostępu WYŁĄCZNIE w webhooku (`/api/webhooks/stripe`) —
  szkielet z pełną normalizacją eventów (w tym async P24) już działa.
- E-mail `purchase_confirmation` (Faza 6 — Resend) musi zawierać:
  nazwę kursu, cenę, walutę, datę zakupu, okres dostępu 12 miesięcy,
  informację o aktywacji po potwierdzeniu płatności, potwierdzenie zgody na
  natychmiastowe dostarczenie treści cyfrowej, potwierdzenie przyjęcia do
  wiadomości utraty prawa odstąpienia, linki do /regulamin,
  /polityka-prywatnosci, /zwroty-i-reklamacje.

## Zasady stałe

- Zmiana treści dokumentu ⇒ podbicie wersji w `lib/legal/consents.ts`
  (`LEGAL_VERSIONS`) — wersja trafia do snapshotu każdego zamówienia.
- `[DATA]`, `[PEŁNA NAZWA FIRMY...]`, `[NIP]` itd. — placeholdery do
  uzupełnienia przez właściciela PRZED publikacją.
- Baner cookies: niepotrzebny dopóki używamy wyłącznie cookies niezbędnych;
  obowiązkowy przy wdrożeniu analityki/marketingu.
- Dostępu NIGDY nie aktywuje /checkout/success — tylko webhook.
