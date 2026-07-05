import { NextResponse } from "next/server";
import { renderEmail, type TemplateKey } from "@/lib/emails/templates";

/**
 * Podgląd szablonów e-maili — WYŁĄCZNIE w trybie deweloperskim.
 * W produkcji zwraca 404 (narzędzie do przeglądania wyglądu maili).
 *   /api/dev/email-preview?template=purchase_confirmation
 */
const SAMPLE: Record<string, Record<string, unknown>> = {
  purchase_confirmation: {
    courseTitle: "Rozwiązania blacharskie płaszczy ochronnych",
    amount: 34900,
    currency: "PLN",
    purchaseDate: "5.07.2026",
  },
  access_activated: {
    courseTitle: "Rozwiązania blacharskie płaszczy ochronnych",
    accessExpires: "5.07.2027",
  },
  expiry_reminder_30: {
    courseTitle: "Rozwiązania blacharskie płaszczy ochronnych",
    courseSlug: "bla-110",
    accessExpires: "30.07.2026",
  },
  expiry_reminder_7: {
    courseTitle: "Rozwiązania blacharskie płaszczy ochronnych",
    courseSlug: "bla-110",
    accessExpires: "7.07.2026",
  },
  access_expired: {
    courseTitle: "Rozwiązania blacharskie płaszczy ochronnych",
    courseSlug: "bla-110",
  },
  certificate_issued: {
    courseTitle: "Rozwiązania blacharskie płaszczy ochronnych",
    certificateNumber: "MK/2026/00001",
    verifyUrl: "https://markowekursy.pl/verify-certificate/abc123",
  },
};

export async function GET(req: Request) {
  if (process.env.NODE_ENV !== "development") {
    return new NextResponse("Not found", { status: 404 });
  }
  const key = (new URL(req.url).searchParams.get("template") ||
    "purchase_confirmation") as TemplateKey;
  const payload = SAMPLE[key] ?? {};
  const { subject, html } = renderEmail(key, payload);
  return new NextResponse(
    html.replace("</head>", `<title>${subject}</title></head>`),
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}
