import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { AdminH1, Table, Td, StatusPill } from "@/components/admin/ui";
import ActionButton from "@/components/admin/ActionButton";
import {
  revokeCertificateAction,
  regenerateCertificateAction,
} from "@/app/admin/actions";
import { getCourse } from "@/lib/courses";

export const metadata: Metadata = {
  title: "Certyfikaty - Panel admina",
  robots: { index: false },
};

const fmt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("pl-PL") : "-";

export default async function AdminCertificatesPage() {
  const { admin } = await requireAdmin();

  const { data: certs } = await admin
    .from("certificates")
    .select(
      "id, certificate_number, status, issued_at, verification_slug, profiles(full_name, email), courses(slug)"
    )
    .order("issued_at", { ascending: false })
    .limit(300);

  return (
    <>
      <AdminH1>Certyfikaty</AdminH1>
      <Table
        head={["Numer", "Kursant", "Kurs", "Wydany", "Status", "Akcje"]}
      >
        {(certs ?? []).map((c) => {
          const prof = c.profiles as unknown as {
            full_name: string;
            email: string;
          } | null;
          const slug =
            (c.courses as unknown as { slug: string } | null)?.slug ?? "";
          const active = c.status === "generated";
          return (
            <tr key={c.id as string}>
              <Td mono>{c.certificate_number as string}</Td>
              <Td>
                <div style={{ fontWeight: 600 }}>{prof?.full_name || "-"}</div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>
                  {prof?.email}
                </div>
              </Td>
              <Td>{getCourse(slug)?.title ?? slug}</Td>
              <Td mono>{fmt(c.issued_at as string)}</Td>
              <Td>
                <StatusPill status={c.status as string} />
              </Td>
              <Td>
                <span style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <a
                    href={`/verify-certificate/${c.verification_slug}`}
                    target="_blank"
                    style={{
                      font: "600 12px var(--sans)",
                      color: "var(--sub)",
                      textDecoration: "none",
                      alignSelf: "center",
                    }}
                  >
                    Weryfikacja ↗
                  </a>
                  {active && (
                    <ActionButton
                      action={revokeCertificateAction}
                      fields={{ certId: c.id as string }}
                      label="Unieważnij"
                      confirmMsg="Unieważnić ten certyfikat? Publiczna weryfikacja pokaże status: unieważniony."
                      danger
                    />
                  )}
                  <ActionButton
                    action={regenerateCertificateAction}
                    fields={{ certId: c.id as string }}
                    label="Wygeneruj ponownie"
                    confirmMsg="Wygenerować certyfikat ponownie (z aktualnym imieniem i nazwiskiem)? Obecny zostanie unieważniony."
                    subtle
                  />
                </span>
              </Td>
            </tr>
          );
        })}
      </Table>
      {(certs ?? []).length === 0 && (
        <p style={{ marginTop: 16, color: "var(--muted)", fontSize: 13 }}>
          Brak wydanych certyfikatów.
        </p>
      )}
    </>
  );
}
