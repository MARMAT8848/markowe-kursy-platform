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

export function Table({
  head,
  children,
  minWidth = 640,
}: {
  head: string[];
  children: ReactNode;
  /** Szerokość, poniżej której tabela zaczyna się przewijać w poziomie.
   *  Wąskie tabele (2-3 kolumny) powinny podać mniejszą wartość, żeby nie
   *  wymuszać przewijania w wąskim kontenerze. */
  minWidth?: number;
}) {
  return (
    <div style={{ overflowX: "auto", border: "1px solid var(--border)", borderRadius: 12 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth }}>
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
        // cyfry w kolumnach muszą się wyrównywać pionowo
        fontVariantNumeric: mono ? "tabular-nums" : undefined,
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

/**
 * Kafelek statystyki. `delta` to zmiana względem nazwanego okresu —
 * znak (+/-) niesie kierunek niezależnie od koloru (nie polegamy na
 * samym kolorze). `upIsGood` odwraca semantykę tam, gdzie wzrost jest zły.
 */
export function StatCard({
  label,
  value,
  delta,
  deltaLabel,
  upIsGood = true,
  hint,
}: {
  label: string;
  value: ReactNode;
  delta?: number;
  deltaLabel?: string;
  upIsGood?: boolean;
  hint?: string;
}) {
  const good = delta === undefined ? null : delta === 0 ? null : delta > 0 === upIsGood;
  const deltaColor =
    good === null ? "var(--muted)" : good ? "#2E7D46" : "#E1121A";
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
      {/* wartość: proporcjonalne cyfry (bez tabular-nums) — to liczba
          samodzielna, nie kolumna */}
      <div style={{ font: "600 26px var(--sans)", color: "var(--ink)" }}>
        {value}
      </div>
      {delta !== undefined && (
        <div
          style={{
            fontSize: 11.5,
            color: deltaColor,
            fontWeight: 600,
            marginTop: 4,
          }}
        >
          {delta > 0 ? "+" : ""}
          {delta}
          {deltaLabel ? ` ${deltaLabel}` : ""}
        </div>
      )}
      {hint && (
        <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 4 }}>
          {hint}
        </div>
      )}
    </div>
  );
}

/**
 * Liczba, którą prowadzi pulpit. Dokładnie jedna na widok, >=48px,
 * ta sama rodzina fontu co reszta (bez krojów display/szeryfowych),
 * cyfry proporcjonalne.
 */
export function HeroFigure({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "22px 24px",
        minWidth: 260,
      }}
    >
      <div
        style={{
          fontFamily: "var(--mono)",
          fontSize: 10,
          letterSpacing: ".1em",
          color: "var(--muted)",
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div
        style={{
          font: "600 48px/1 var(--sans)",
          letterSpacing: "-.02em",
          color: "var(--ink)",
        }}
      >
        {value}
      </div>
      {hint && (
        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 8 }}>
          {hint}
        </div>
      )}
    </div>
  );
}

/**
 * Meter — proporcja względem odniesienia. Wypełnienie w akcencie,
 * tor to jaśniejszy stopień tej samej rampy (nie szarość), więc stan
 * czyta się przez całą szerokość paska.
 */
export function Meter({
  value,
  max,
  width = 90,
}: {
  value: number;
  max: number;
  width?: number;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-block",
        width,
        height: 6,
        borderRadius: 99,
        background: "rgba(225,18,26,.14)",
        overflow: "hidden",
        verticalAlign: "middle",
      }}
    >
      <span
        style={{
          display: "block",
          width: `${pct}%`,
          height: "100%",
          borderRadius: 99,
          background: "var(--accent)",
        }}
      ></span>
    </span>
  );
}
