import type { CSSProperties, ReactNode } from "react";

export function AdminH1({ children }: { children: ReactNode }) {
  return (
    <h1
      style={{
        margin: "0 0 20px",
        font: "600 24px/1.15 var(--sans)",
        letterSpacing: "-.025em",
        color: "var(--ink)",
      }}
    >
      {children}
    </h1>
  );
}

const cell: CSSProperties = {
  padding: "10px 12px",
  fontSize: 13,
  textAlign: "left",
  verticalAlign: "middle",
  borderBottom: "1px solid var(--border-soft)",
};

export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div style={{ overflowX: "auto", border: "1px solid var(--border)", borderRadius: 12 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
        <thead>
          <tr>
            {head.map((h) => (
              <th
                key={h}
                style={{
                  ...cell,
                  fontFamily: "var(--mono)",
                  fontSize: 10.5,
                  letterSpacing: ".06em",
                  color: "var(--muted)",
                  background: "var(--bg-off)",
                  fontWeight: 600,
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Td({
  children,
  mono,
  color,
}: {
  children: ReactNode;
  mono?: boolean;
  color?: string;
}) {
  return (
    <td
      style={{
        ...cell,
        color: color ?? "var(--ink)",
        fontFamily: mono ? "var(--mono)" : "var(--sans)",
        fontSize: mono ? 12 : 13,
      }}
    >
      {children}
    </td>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, { bg: string; fg: string }> = {
    active: { bg: "#EAF3EC", fg: "#2E7D46" },
    generated: { bg: "#EAF3EC", fg: "#2E7D46" },
    published: { bg: "#EAF3EC", fg: "#2E7D46" },
    paid: { bg: "#EAF3EC", fg: "#2E7D46" },
    expired: { bg: "#F2F1EE", fg: "#6F6F6F" },
    coming_soon: { bg: "#F2F1EE", fg: "#6F6F6F" },
    pending: { bg: "#FCF3E8", fg: "#8A5A00" },
    revoked: { bg: "#FCE8E9", fg: "#E1121A" },
    failed: { bg: "#FCE8E9", fg: "#E1121A" },
  };
  const s = map[status] ?? { bg: "#F2F1EE", fg: "#6F6F6F" };
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 8px",
        borderRadius: 5,
        background: s.bg,
        color: s.fg,
        font: "600 10.5px var(--mono)",
        letterSpacing: ".04em",
      }}
    >
      {status}
    </span>
  );
}

export function StatCard({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "16px 18px",
        minWidth: 140,
      }}
    >
      <div
        style={{
          fontFamily: "var(--mono)",
          fontSize: 10,
          letterSpacing: ".1em",
          color: "var(--muted)",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div style={{ font: "600 26px var(--sans)", color: "var(--ink)" }}>
        {value}
      </div>
    </div>
  );
}
