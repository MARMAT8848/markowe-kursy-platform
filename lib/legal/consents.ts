/**
 * Zgody prawne przy checkout + wersjonowanie dokumentów.
 *
 * NAJWAŻNIEJSZY element wdrożenia prawnego (wymóg właściciela):
 * - 4 osobne checkboxy, ŻADEN nie może być domyślnie zaznaczony,
 * - zakup nie może przejść bez kompletu zgód (walidacja także server-side),
 * - każda zgoda zapisywana w orders z datą, wersjami dokumentów, IP,
 *   user-agentem i pełnym snapshotem treści (checkout_legal_snapshot_json),
 * - po zakupie e-mail potwierdzający złożenie zgód (szablon
 *   'purchase_confirmation', Faza 6),
 * - dostęp aktywuje wyłącznie zweryfikowany webhook płatności.
 */

export interface LegalDocument {
  slug: string;
  title: string;
  version: string;
  effectiveDate: string;
  body: string;
}

/** Aktualne wersje dokumentów — podbij przy każdej zmianie treści. */
export const LEGAL_VERSIONS = {
  terms: "1.0",
  privacy: "1.0",
  refund: "1.0",
  cookies: "1.0",
} as const;

/** Data obowiązywania — uzupełnić przed publikacją serwisu. */
export const LEGAL_EFFECTIVE_DATE = "[DATA]";

export type ConsentKey =
  | "terms_privacy"
  | "refund_policy"
  | "digital_content"
  | "withdrawal_loss";

export const CONSENT_KEYS: ConsentKey[] = [
  "terms_privacy",
  "refund_policy",
  "digital_content",
  "withdrawal_loss",
];

/** Dokładna treść checkboxów — brzmienie ustalone, nie zmieniać bez podbicia wersji. */
export const CONSENTS: {
  key: ConsentKey;
  label: string;
  links?: { text: string; href: string }[];
}[] = [
  {
    key: "terms_privacy",
    label:
      "Akceptuję Regulamin platformy Markowe Kursy oraz zapoznałem/am się z Polityką prywatności.",
    links: [
      { text: "Regulamin", href: "/regulamin" },
      { text: "Polityka prywatności", href: "/polityka-prywatnosci" },
    ],
  },
  {
    key: "refund_policy",
    label:
      "Zapoznałem/am się z Polityką zwrotów, odstąpienia od umowy i reklamacji.",
    links: [
      { text: "Polityka zwrotów i reklamacji", href: "/zwroty-i-reklamacje" },
    ],
  },
  {
    key: "digital_content",
    label:
      "Wyrażam zgodę na rozpoczęcie dostarczania treści cyfrowej przed upływem 14 dni od zawarcia umowy.",
  },
  {
    key: "withdrawal_loss",
    label:
      "Przyjmuję do wiadomości, że po rozpoczęciu dostępu do kursu utracę prawo odstąpienia od umowy.",
  },
];

export interface ConsentFlags {
  terms_privacy: boolean;
  refund_policy: boolean;
  digital_content: boolean;
  withdrawal_loss: boolean;
}

export function allConsentsGiven(c: Partial<ConsentFlags> | undefined | null) {
  if (!c) return false;
  return CONSENT_KEYS.every((k) => c[k] === true);
}

/**
 * Snapshot prawny zapisywany w orders.checkout_legal_snapshot_json —
 * dokładna treść zaakceptowanych zgód + wersje i daty dokumentów
 * w chwili zakupu.
 */
export function buildLegalSnapshot(input: {
  acceptedAt: Date;
  userIp: string | null;
  userAgent: string | null;
}) {
  const acceptedAtIso = input.acceptedAt.toISOString();
  return {
    accepted_at: acceptedAtIso,
    user_ip: input.userIp,
    user_agent: input.userAgent,
    document_versions: {
      terms: LEGAL_VERSIONS.terms,
      privacy_policy: LEGAL_VERSIONS.privacy,
      refund_policy: LEGAL_VERSIONS.refund,
      cookie_policy: LEGAL_VERSIONS.cookies,
    },
    documents_effective_date: LEGAL_EFFECTIVE_DATE,
    consents: CONSENTS.map((c) => ({
      key: c.key,
      text: c.label,
      accepted: true,
      accepted_at: acceptedAtIso,
    })),
  };
}

/**
 * Kolumny orders wypełniane przy tworzeniu zamówienia (Faza 4 — insert
 * do Supabase; struktura gotowa już teraz).
 */
export function buildOrderConsentColumns(input: {
  acceptedAt: Date;
  userIp: string | null;
  userAgent: string | null;
}) {
  const ts = input.acceptedAt.toISOString();
  return {
    terms_accepted_at: ts,
    privacy_policy_accepted_at: ts,
    refund_policy_accepted_at: ts,
    digital_content_consent_at: ts,
    withdrawal_loss_acknowledged_at: ts,
    accepted_terms_version: LEGAL_VERSIONS.terms,
    accepted_privacy_policy_version: LEGAL_VERSIONS.privacy,
    accepted_refund_policy_version: LEGAL_VERSIONS.refund,
    accepted_cookie_policy_version: LEGAL_VERSIONS.cookies,
    user_ip: input.userIp,
    user_agent: input.userAgent,
    checkout_legal_snapshot_json: buildLegalSnapshot(input),
  };
}
