"use client";

import Link from "next/link";
import { useState } from "react";
import { CONSENTS, type ConsentKey } from "@/lib/legal/consents";

/**
 * Zgody prawne przy checkout — 4 osobne checkboxy, ŻADEN nie jest
 * domyślnie zaznaczony. Przycisk płatności jest zablokowany do czasu
 * zaznaczenia wszystkich. Walidacja jest DODATKOWO powtarzana
 * server-side w /api/checkout/create (nie ufamy frontendowi).
 */
export default function CheckoutConsents({
  courseSlug,
  courseTitle,
  priceLabel,
}: {
  courseSlug: string;
  courseTitle: string;
  priceLabel: string;
}) {
  const [checked, setChecked] = useState<Record<ConsentKey, boolean>>({
    terms_privacy: false,
    refund_policy: false,
    digital_content: false,
    withdrawal_loss: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const allChecked = CONSENTS.every((c) => checked[c.key]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!allChecked || submitting) return;
    setSubmitting(true);
    setNotice(null);
    try {
      const res = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseSlug, consents: checked }),
      });
      const data = await res.json();
      if (res.ok && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      setNotice(
        data.message ||
          "Nie udało się rozpocząć płatności. Spróbuj ponownie za chwilę."
      );
    } catch {
      setNotice("Błąd połączenia. Spróbuj ponownie za chwilę.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ maxWidth: 640 }}>
      {/* podsumowanie zamówienia */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 16,
          padding: "16px 18px",
          border: "1px solid var(--border)",
          borderRadius: 13,
          marginBottom: 22,
          background: "var(--bg-off)",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: 10,
              letterSpacing: ".1em",
              color: "var(--muted)",
              marginBottom: 4,
            }}
          >
            KURS
          </div>
          <div style={{ font: "600 15.5px var(--sans)", color: "var(--ink)" }}>
            {courseTitle}
          </div>
          <div
            style={{
              fontSize: 12.5,
              color: "var(--sub)",
              marginTop: 4,
            }}
          >
            Dostęp przez 12 miesięcy od potwierdzenia płatności
          </div>
        </div>
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: 22,
            fontWeight: 600,
            color: "var(--ink)",
            whiteSpace: "nowrap",
          }}
        >
          {priceLabel}
        </div>
      </div>

      {/* 4 wymagane zgody */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          marginBottom: 20,
        }}
      >
        {CONSENTS.map((c) => (
          <label
            key={c.key}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 11,
              padding: "13px 14px",
              border: `1px solid ${checked[c.key] ? "var(--ink)" : "var(--border)"}`,
              borderRadius: 10,
              cursor: "pointer",
              background: "#fff",
              transition: "border-color .15s",
            }}
          >
            <input
              type="checkbox"
              checked={checked[c.key]}
              onChange={(e) =>
                setChecked((prev) => ({ ...prev, [c.key]: e.target.checked }))
              }
              style={{
                marginTop: 2,
                width: 16,
                height: 16,
                accentColor: "var(--accent)",
                flex: "none",
              }}
            />
            <span
              style={{
                fontSize: 13,
                lineHeight: 1.5,
                color: "#3A3A3A",
              }}
            >
              {c.label}
              {c.links && (
                <span style={{ display: "block", marginTop: 4 }}>
                  {c.links.map((l, i) => (
                    <span key={l.href}>
                      {i > 0 && " · "}
                      <Link
                        href={l.href}
                        target="_blank"
                        style={{
                          color: "var(--accent)",
                          fontWeight: 600,
                          textDecoration: "none",
                          fontSize: 12.5,
                        }}
                      >
                        {l.text} →
                      </Link>
                    </span>
                  ))}
                </span>
              )}
            </span>
          </label>
        ))}
      </div>

      {notice && (
        <div className="form-confirm" style={{ marginBottom: 16 }}>
          {notice}
        </div>
      )}

      <button
        type="submit"
        disabled={!allChecked || submitting}
        className="form-submit"
        style={{
          width: "100%",
          opacity: allChecked ? 1 : 0.45,
          cursor: allChecked ? "pointer" : "not-allowed",
        }}
      >
        {submitting ? "Przetwarzanie…" : "Przejdź do płatności"}
      </button>
      <p
        style={{
          margin: "12px 0 0",
          fontSize: 11.5,
          lineHeight: 1.5,
          color: "var(--muted)",
        }}
      >
        Płatność jest obsługiwana przez zewnętrznego operatora płatności. Nie
        przechowujemy danych kart płatniczych. Dostęp do kursu zostanie
        aktywowany automatycznie po potwierdzeniu płatności przez operatora.
      </p>
    </form>
  );
}
