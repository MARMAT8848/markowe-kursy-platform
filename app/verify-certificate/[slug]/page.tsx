import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { getCourse } from "@/lib/courses";

export const metadata: Metadata = {
  title: "Weryfikacja certyfikatu — MARKOWE KURSY",
  description:
    "Publiczna weryfikacja autentyczności certyfikatów platformy Markowe Kursy.",
  robots: { index: false },
};

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("pl-PL") : "—";

/**
 * Publiczna weryfikacja certyfikatu (ETAP 17) — pokazuje WYŁĄCZNIE
 * minimalny zakres danych: status, numer, imię i nazwisko, kurs, datę.
 */
export default async function VerifyCertificatePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const admin = createSupabaseAdmin();

  const { data: cert } = await admin
    .from("certificates")
    .select(
      "certificate_number, status, issued_at, revoked_at, profiles(full_name), courses(slug)"
    )
    .eq("verification_slug", slug)
    .maybeSingle();

  const courseSlug = (cert?.courses as unknown as { slug: string } | null)
    ?.slug;
  const courseTitle = courseSlug ? getCourse(courseSlug)?.title : undefined;
  const fullName = (cert?.profiles as unknown as { full_name: string } | null)
    ?.full_name;
  const active = cert?.status === "generated";

  return (
    <>
      <SiteHeader />
      <section className="kontakt-head">
        <div className="wrap">
          <div className="kicker-row">
            <span className="kicker-line"></span>
            <span className="kicker">WERYFIKACJA CERTYFIKATU</span>
          </div>
          <h1
            style={{
              margin: "0 0 10px",
              font: "600 28px/1.15 var(--sans)",
              letterSpacing: "-.03em",
              color: "var(--ink)",
            }}
          >
            {cert
              ? active
                ? "Certyfikat jest autentyczny"
                : "Certyfikat został unieważniony"
              : "Nie znaleziono certyfikatu"}
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              lineHeight: 1.55,
              color: "var(--sub)",
              maxWidth: 560,
            }}
          >
            {cert
              ? "Poniższe dane pochodzą bezpośrednio z rejestru certyfikatów platformy Markowe Kursy."
              : "Sprawdź, czy link lub kod QR jest kompletny. Certyfikat o tym identyfikatorze nie istnieje w rejestrze."}
          </p>
        </div>
      </section>

      {cert && (
        <section style={{ padding: "36px 0 56px", background: "#fff" }}>
          <div className="wrap">
            <div
              style={{
                maxWidth: 560,
                border: `1px solid ${active ? "var(--border)" : "var(--accent)"}`,
                borderRadius: 14,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "12px 18px",
                  background: active ? "#EAF3EC" : "#FCE8E9",
                  color: active ? "#2E7D46" : "var(--accent)",
                  font: "600 12.5px var(--sans)",
                  letterSpacing: ".04em",
                }}
              >
                {active ? "✓ CERTYFIKAT AKTYWNY" : "✕ CERTYFIKAT UNIEWAŻNIONY"}
              </div>
              <div
                style={{
                  padding: "20px 18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                {[
                  ["NUMER CERTYFIKATU", cert.certificate_number],
                  ["IMIĘ I NAZWISKO", fullName ?? "—"],
                  ["KURS", courseTitle ?? "—"],
                  ["DATA UKOŃCZENIA", fmtDate(cert.issued_at)],
                  ...(active
                    ? []
                    : [["DATA UNIEWAŻNIENIA", fmtDate(cert.revoked_at)]]),
                ].map(([label, value]) => (
                  <div key={label as string}>
                    <div
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: 10,
                        letterSpacing: ".1em",
                        color: "var(--muted)",
                        marginBottom: 3,
                      }}
                    >
                      {label}
                    </div>
                    <div
                      style={{
                        font: "600 15px var(--sans)",
                        color: "var(--ink)",
                      }}
                    >
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
      <SiteFooter />
    </>
  );
}
