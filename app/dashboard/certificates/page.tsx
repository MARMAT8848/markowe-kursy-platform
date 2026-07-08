import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import PanelHeader from "@/components/dashboard/PanelHeader";
import PanelShell from "@/components/dashboard/PanelShell";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getCourse } from "@/lib/courses";

export const metadata: Metadata = {
  title: "Twoje certyfikaty - MARKOWE KURSY",
};

export default async function CertificatesPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/certificates");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .maybeSingle();

  const { data: certs } = await supabase
    .from("certificates")
    .select("id, certificate_number, status, issued_at, verification_slug, courses(slug)")
    .order("issued_at", { ascending: false });

  const rows = (certs ?? []).map((c) => {
    const slug = (c.courses as unknown as { slug: string } | null)?.slug ?? "";
    return {
      id: c.id as string,
      number: c.certificate_number as string,
      active: c.status === "generated",
      issued: c.issued_at
        ? new Date(c.issued_at).toLocaleDateString("pl-PL")
        : "-",
      title: getCourse(slug)?.title ?? slug.toUpperCase(),
      verifySlug: c.verification_slug as string,
    };
  });

  return (
    <PanelShell>
      <PanelHeader
        fullName={profile?.full_name ?? ""}
        leaveHref="/dashboard"
        leaveLabel="Wróć do panelu"
      />
      <section style={{ padding: "34px 0 44px" }}>
        <div className="wrap">
          <div className="kicker-row">
            <span className="kicker-line"></span>
            <span className="kicker">CERTYFIKATY</span>
          </div>
          <h1
            style={{
              margin: "0 0 22px",
              font: "600 26px/1.15 var(--sans)",
              letterSpacing: "-.025em",
              color: "var(--ink)",
            }}
          >
            Twoje certyfikaty
          </h1>

          {rows.length === 0 ? (
            <p
              style={{
                margin: 0,
                fontSize: 14.5,
                lineHeight: 1.6,
                color: "var(--sub)",
                maxWidth: 620,
              }}
            >
              Nie masz jeszcze żadnego certyfikatu. Certyfikat generuje się
              automatycznie po ukończeniu wszystkich lekcji kursu - znajdziesz
              go tutaj i pobierzesz jako PDF.
            </p>
          ) : (
            <div className="module-lessons" style={{ maxWidth: 860 }}>
              {rows.map((r) => (
                <div className="lrow" key={r.id} style={{ cursor: "default" }}>
                  <span className="lrow-mid">
                    <span className="lrow-kicker">
                      {r.number} · WYDANY {r.issued}
                      {!r.active && " · UNIEWAŻNIONY"}
                    </span>
                    <span className="lrow-title">{r.title}</span>
                  </span>
                  <Link
                    href={`/verify-certificate/${r.verifySlug}`}
                    style={{
                      flex: "none",
                      font: "600 12px var(--sans)",
                      color: "var(--sub)",
                      textDecoration: "none",
                      marginRight: 6,
                    }}
                  >
                    Weryfikacja →
                  </Link>
                  {r.active && (
                    <a
                      className="lrow-cta"
                      href={`/api/certificates/${r.id}/download`}
                    >
                      <span className="lrow-cta-lbl">Pobierz PDF</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </PanelShell>
  );
}
