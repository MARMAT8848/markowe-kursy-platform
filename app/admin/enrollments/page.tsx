import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { AdminH1, Table, Td, StatusPill } from "@/components/admin/ui";
import ActionButton from "@/components/admin/ActionButton";
import { extendAccessAction, revokeAccessAction } from "@/app/admin/actions";
import { getCourse } from "@/lib/courses";

export const metadata: Metadata = {
  title: "Dostępy — Panel admina",
  robots: { index: false },
};

const fmt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("pl-PL") : "—";

export default async function AdminEnrollmentsPage() {
  const { admin } = await requireAdmin();

  const { data: rows } = await admin
    .from("enrollments")
    .select(
      "id, status, access_start_at, access_expires_at, created_at, profiles(email, full_name), courses(slug)"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  const nowIso = new Date().toISOString();

  return (
    <>
      <AdminH1>Dostępy do kursów</AdminH1>
      <p
        style={{
          margin: "0 0 20px",
          fontSize: 13.5,
          color: "var(--sub)",
          maxWidth: 640,
        }}
      >
        Nadawanie dostępu odbywa się automatycznie po opłaceniu (webhook) lub
        ręcznie w zakładce Użytkownicy. Tutaj przedłużasz o kolejne 12 miesięcy
        lub cofasz dostęp.
      </p>

      <Table
        head={["Kursant", "Kurs", "Status", "Od", "Do", "Akcje"]}
      >
        {(rows ?? []).map((e) => {
          const prof = e.profiles as unknown as {
            email: string;
            full_name: string;
          } | null;
          const slug =
            (e.courses as unknown as { slug: string } | null)?.slug ?? "";
          const courseTitle = getCourse(slug)?.title ?? slug;
          const activeNow =
            e.status === "active" &&
            !!e.access_expires_at &&
            e.access_expires_at > nowIso;
          const displayStatus = activeNow
            ? "active"
            : e.status === "active"
              ? "expired"
              : e.status;
          return (
            <tr key={e.id}>
              <Td>
                <div style={{ fontWeight: 600 }}>{prof?.full_name || "—"}</div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>
                  {prof?.email}
                </div>
              </Td>
              <Td>{courseTitle}</Td>
              <Td>
                <StatusPill status={displayStatus} />
              </Td>
              <Td mono>{fmt(e.access_start_at)}</Td>
              <Td mono>{fmt(e.access_expires_at)}</Td>
              <Td>
                <span style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <ActionButton
                    action={extendAccessAction}
                    fields={{ enrollmentId: e.id }}
                    label="+12 mies."
                    pendingLabel="…"
                    subtle
                  />
                  <ActionButton
                    action={revokeAccessAction}
                    fields={{ enrollmentId: e.id }}
                    label="Cofnij"
                    pendingLabel="…"
                    confirmMsg="Cofnąć dostęp temu kursantowi?"
                    danger
                  />
                </span>
              </Td>
            </tr>
          );
        })}
      </Table>
      {(rows ?? []).length === 0 && (
        <p style={{ marginTop: 16, color: "var(--muted)", fontSize: 13 }}>
          Brak dostępów.
        </p>
      )}
    </>
  );
}
