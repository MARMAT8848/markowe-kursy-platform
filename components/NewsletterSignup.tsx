"use client";

import Link from "next/link";
import { useState } from "react";

/**
 * Zapis do newslettera (stopka). Double opt-in: po wysłaniu formularza
 * użytkownik dostaje e-mail z linkiem potwierdzającym. Ukryte pole
 * "website" to honeypot na boty.
 */
export default function NewsletterSignup() {
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "busy") return;
    const form = new FormData(e.currentTarget);
    setState("busy");
    setMsg(null);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(form.get("email") ?? ""),
          website: String(form.get("website") ?? ""),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setState("done");
        setMsg(data.message ?? "Sprawdź skrzynkę, aby potwierdzić zapis.");
      } else {
        setState("error");
        setMsg(data.message ?? "Nie udało się zapisać. Spróbuj ponownie.");
      }
    } catch {
      setState("error");
      setMsg("Błąd połączenia. Spróbuj ponownie.");
    }
  }

  return (
    <div style={{ maxWidth: 460 }}>
      <div
        style={{
          font: "600 13px var(--sans)",
          color: "#fff",
          marginBottom: 4,
        }}
      >
        Zapisz się na Newsletter, aby na bieżąco otrzymywać informacje o nowych kursach, lekcjach i promocjach
      </div>
      {state === "done" ? (
        <p style={{ margin: "6px 0 0", fontSize: 12, color: "#9C9B98" }}>
          ✓ {msg}
        </p>
      ) : (
        <>
          <form
            onSubmit={onSubmit}
            style={{ display: "flex", gap: 8, marginTop: 8 }}
          >
            {/* honeypot - niewidoczne dla ludzi, wypełniają je boty */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              style={{ position: "absolute", left: -9999, width: 1, height: 1 }}
            />
            <input
              type="email"
              name="email"
              required
              placeholder="Twój adres e-mail"
              style={{
                flex: 1,
                minWidth: 0,
                padding: "9px 12px",
                borderRadius: 9,
                border: "1px solid #3A3A3A",
                background: "#232323",
                color: "#fff",
                font: "13px var(--sans)",
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={state === "busy"}
              className="btn btn-primary"
              style={{ padding: "9px 16px", fontSize: 13 }}
            >
              {state === "busy" ? "…" : "Zapisz się"}
            </button>
          </form>
          {state === "error" && msg && (
            <p style={{ margin: "6px 0 0", fontSize: 11.5, color: "#E1121A" }}>
              {msg}
            </p>
          )}
          <p
            style={{
              margin: "7px 0 0",
              fontSize: 10.5,
              lineHeight: 1.5,
              color: "#6F6F6F",
            }}
          >
            Zapis wymaga potwierdzenia e-mailem (double opt-in). Wypiszesz się
            jednym kliknięciem. Szczegóły:{" "}
            <Link
              href="/polityka-prywatnosci"
              style={{ color: "#9C9B98" }}
            >
              Polityka prywatności
            </Link>
            .
          </p>
        </>
      )}
    </div>
  );
}
