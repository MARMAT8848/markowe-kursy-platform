"use client";

import { useState, useTransition } from "react";

type ActionResult = { ok: boolean; error?: string };

/**
 * Przycisk wywołujący akcję serwerową admina z ręcznie budowanym
 * FormData. Obsługuje potwierdzenie (confirm), stan oczekiwania i błąd.
 * Akcja i tak re-weryfikuje uprawnienia po stronie serwera.
 */
export default function ActionButton({
  action,
  fields,
  label,
  pendingLabel = "…",
  confirmMsg,
  danger,
  subtle,
}: {
  action: (fd: FormData) => Promise<ActionResult>;
  fields: Record<string, string>;
  label: string;
  pendingLabel?: string;
  confirmMsg?: string;
  danger?: boolean;
  subtle?: boolean;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run() {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    setError(null);
    const fd = new FormData();
    Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
    start(async () => {
      const res = await action(fd);
      if (res && !res.ok) setError(res.error || "Wystąpił błąd.");
    });
  }

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <button
        type="button"
        onClick={run}
        disabled={pending}
        style={{
          padding: subtle ? "5px 10px" : "7px 12px",
          borderRadius: 8,
          border: "1px solid",
          borderColor: danger ? "var(--accent)" : "var(--border)",
          background: danger ? "var(--accent)" : subtle ? "#fff" : "var(--ink)",
          color: danger || !subtle ? "#fff" : "var(--ink)",
          font: "600 12px var(--sans)",
          cursor: pending ? "default" : "pointer",
          opacity: pending ? 0.6 : 1,
          whiteSpace: "nowrap",
        }}
      >
        {pending ? pendingLabel : label}
      </button>
      {error && (
        <span style={{ fontSize: 11, color: "var(--accent)" }}>{error}</span>
      )}
    </span>
  );
}
