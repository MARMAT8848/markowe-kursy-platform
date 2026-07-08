import { emailLayout, button, infoRow } from "./layout";

/**
 * Szablony e-maili. Każdy: template_key + language + funkcja renderująca
 * { subject, html } z payloadu. Na start PL; struktura gotowa pod EN/NO/DE
 * (dodać kolejne języki w mapie).
 *
 * UWAGA: potwierdzenie rejestracji i reset hasła obsługuje wbudowana
 * poczta Supabase Auth — nie dublujemy ich tutaj.
 */
const envSite = process.env.NEXT_PUBLIC_SITE_URL;
const SITE =
  envSite && !envSite.includes("localhost") ? envSite : "https://markowekursy.pl";

export type TemplateKey =
  | "purchase_confirmation"
  | "access_activated"
  | "expiry_reminder_30"
  | "expiry_reminder_7"
  | "access_expired"
  | "certificate_issued"
  | "newsletter_confirm"
  | "newsletter_campaign";

export interface RenderedEmail {
  subject: string;
  html: string;
}

type Renderer = (payload: Record<string, unknown>) => RenderedEmail;

const zl = (grosze: number, currency = "PLN") =>
  `${(grosze / 100).toFixed(2).replace(".", ",")} ${currency}`;

const PL: Record<TemplateKey, Renderer> = {
  // Prawnie wymagane potwierdzenie zakupu (ETAP 18 + wymogi prawne).
  purchase_confirmation: (p) => {
    const courseTitle = String(p.courseTitle ?? "kurs");
    const amount = Number(p.amount ?? 0);
    const currency = String(p.currency ?? "PLN");
    const purchaseDate = String(p.purchaseDate ?? "");
    return {
      subject: `Potwierdzenie zakupu — ${courseTitle}`,
      html: emailLayout({
        heading: "Dziękujemy za zakup",
        preheader: `Zakup kursu ${courseTitle} — dostęp na 12 miesięcy.`,
        bodyHtml: `
          <p style="margin:0 0 16px">Potwierdzamy zakup kursu na platformie Markowe Kursy.</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px">
            ${infoRow("Kurs", courseTitle)}
            ${infoRow("Cena", zl(amount, currency))}
            ${infoRow("Data zakupu", purchaseDate)}
            ${infoRow("Okres dostępu", "12 miesięcy od aktywacji")}
          </table>
          <p style="margin:0 0 14px">Dostęp do kursu rozpoczyna się po potwierdzeniu płatności przez operatora płatności i pojawi się automatycznie w Twoim panelu kursanta.</p>
          <div style="background:#FBFBFA;border:1px solid #EFEEEB;border-radius:10px;padding:14px 16px;margin:0 0 18px;font-size:12.5px;line-height:1.6;color:#6F6F6F">
            <strong style="color:#161616">Ważne informacje prawne:</strong><br>
            • Wyraziłeś/aś zgodę na rozpoczęcie dostarczania treści cyfrowej przed upływem 14 dni od zawarcia umowy.<br>
            • Przyjąłeś/aś do wiadomości, że po rozpoczęciu dostępu do kursu tracisz prawo odstąpienia od umowy.
          </div>
          <p style="margin:0 0 22px">${button(`${SITE}/dashboard`, "Przejdź do panelu kursanta")}</p>
          <p style="margin:0;font-size:12px;color:#9C9B98">
            Szczegóły w dokumentach:
            <a href="${SITE}/regulamin" style="color:#6F6F6F">Regulamin</a>,
            <a href="${SITE}/polityka-prywatnosci" style="color:#6F6F6F">Polityka prywatności</a>,
            <a href="${SITE}/zwroty-i-reklamacje" style="color:#6F6F6F">Polityka zwrotów i reklamacji</a>.
          </p>`,
      }),
    };
  },

  access_activated: (p) => {
    const courseTitle = String(p.courseTitle ?? "kurs");
    const expires = String(p.accessExpires ?? "");
    return {
      subject: `Dostęp aktywny — ${courseTitle}`,
      html: emailLayout({
        heading: "Twój kurs jest już dostępny",
        preheader: `Masz dostęp do kursu ${courseTitle}.`,
        bodyHtml: `
          <p style="margin:0 0 16px">Płatność została potwierdzona — masz teraz pełny dostęp do kursu <strong>${courseTitle}</strong>.</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px">
            ${infoRow("Dostęp aktywny do", expires)}
          </table>
          <p style="margin:0 0 22px">${button(`${SITE}/dashboard`, "Rozpocznij naukę")}</p>`,
      }),
    };
  },

  expiry_reminder_30: (p) => reminder(p, 30),
  expiry_reminder_7: (p) => reminder(p, 7),

  access_expired: (p) => {
    const courseTitle = String(p.courseTitle ?? "kurs");
    const slug = String(p.courseSlug ?? "");
    return {
      subject: `Dostęp wygasł — ${courseTitle}`,
      html: emailLayout({
        heading: "Twój dostęp do kursu wygasł",
        preheader: `Dostęp do ${courseTitle} wygasł — możesz go odnowić.`,
        bodyHtml: `
          <p style="margin:0 0 16px">Twój 12-miesięczny dostęp do kursu <strong>${courseTitle}</strong> właśnie się zakończył. Historia zakupu oraz wydane certyfikaty pozostają dostępne w Twoim panelu.</p>
          <p style="margin:0 0 22px">${button(`${SITE}/courses/${slug}`, "Odnów dostęp")}</p>`,
      }),
    };
  },

  certificate_issued: (p) => {
    const courseTitle = String(p.courseTitle ?? "kurs");
    const number = String(p.certificateNumber ?? "");
    const verifyUrl = String(p.verifyUrl ?? `${SITE}`);
    return {
      subject: `Certyfikat ukończenia — ${courseTitle}`,
      html: emailLayout({
        heading: "Gratulacje! Ukończyłeś/aś kurs",
        preheader: `Twój certyfikat (${number}) jest gotowy.`,
        bodyHtml: `
          <p style="margin:0 0 16px">Ukończyłeś/aś kurs <strong>${courseTitle}</strong>. Twój certyfikat jest już gotowy do pobrania w panelu kursanta.</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px">
            ${infoRow("Numer certyfikatu", number)}
          </table>
          <p style="margin:0 0 18px">${button(`${SITE}/dashboard/certificates`, "Pobierz certyfikat")}</p>
          <p style="margin:0;font-size:12px;color:#9C9B98">Certyfikat możesz zweryfikować publicznie: <a href="${verifyUrl}" style="color:#6F6F6F">${verifyUrl}</a></p>`,
      }),
    };
  },

  // Double opt-in: potwierdzenie zapisu do newslettera (dowód zgody).
  newsletter_confirm: (p) => {
    const confirmUrl = String(p.confirmUrl ?? SITE);
    return {
      subject: "Potwierdź zapis do newslettera - Markowe Kursy",
      html: emailLayout({
        heading: "Potwierdź zapis do newslettera",
        preheader: "Jedno kliknięcie i gotowe - bez potwierdzenia nic nie wyślemy.",
        bodyHtml: `
          <p style="margin:0 0 16px">Ktoś (mamy nadzieję, że Ty) zapisał ten adres do newslettera Markowe Kursy - informacji o nowych kursach, lekcjach i promocjach.</p>
          <p style="margin:0 0 22px">${button(confirmUrl, "Potwierdzam zapis")}</p>
          <p style="margin:0;font-size:12px;color:#9C9B98">Jeśli to nie Ty - po prostu zignoruj tę wiadomość. Bez potwierdzenia nie wyślemy żadnego newslettera, a adres zostanie nieaktywny.</p>`,
      }),
    };
  },

  // Kampania: temat i treść z panelu admina; stopka wypisu OBOWIĄZKOWA
  // w każdej wiadomości marketingowej.
  newsletter_campaign: (p) => {
    const subject = String(p.subject ?? "Markowe Kursy");
    const contentHtml = String(p.contentHtml ?? "");
    const unsubscribeUrl = String(p.unsubscribeUrl ?? `${SITE}`);
    const preheader = p.preheader ? String(p.preheader) : undefined;
    return {
      subject,
      html: emailLayout({
        heading: subject,
        preheader,
        bodyHtml: `${contentHtml}
          <p style="margin:26px 0 0;padding-top:14px;border-top:1px solid #EFEEEB;font-size:11.5px;line-height:1.6;color:#9C9B98">
            Otrzymujesz tę wiadomość, bo zapisałeś/aś się do newslettera Markowe Kursy i potwierdziłeś/aś zapis.
            <a href="${unsubscribeUrl}" style="color:#6F6F6F">Wypisz się jednym kliknięciem</a>.
          </p>`,
      }),
    };
  },
};

function reminder(p: Record<string, unknown>, days: number): RenderedEmail {
  const courseTitle = String(p.courseTitle ?? "kurs");
  const expires = String(p.accessExpires ?? "");
  const slug = String(p.courseSlug ?? "");
  return {
    subject: `Dostęp wygaśnie za ${days} dni — ${courseTitle}`,
    html: emailLayout({
      heading: `Twój dostęp wygasa za ${days} dni`,
      preheader: `Dostęp do ${courseTitle} wygasa ${expires}.`,
      bodyHtml: `
        <p style="margin:0 0 16px">Przypominamy, że Twój dostęp do kursu <strong>${courseTitle}</strong> wygaśnie <strong>${expires}</strong> (za ${days} dni). Jeśli chcesz dokończyć naukę lub wrócić do materiałów, zrób to przed tą datą.</p>
        <p style="margin:0 0 22px">${button(`${SITE}/dashboard/courses/${slug}`, "Wróć do kursu")}</p>`,
    }),
  };
}

const LANGS: Record<string, Record<TemplateKey, Renderer>> = { pl: PL };

export function renderEmail(
  templateKey: TemplateKey,
  payload: Record<string, unknown>,
  language = "pl"
): RenderedEmail {
  const set = LANGS[language] ?? PL;
  const renderer = set[templateKey] ?? PL[templateKey];
  return renderer(payload);
}
