"use client";

import Link from "next/link";
import { useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/client";

/** Prośba o reset hasła — wysyła link na e-mail. Ze względów
 *  bezpieczeństwa komunikat jest neutralny (nie zdradza, czy konto
 *  istnieje). */
export default function ForgotPasswordCard() {
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setNotice(null);
    const email = String(new FormData(e.currentTarget).get("email"));
    const supabase = createSupabaseBrowser();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    setBusy(false);
    if (error) {
      setNotice("Coś poszło nie tak. Spróbuj ponownie za chwilę.");
      return;
    }
    setSent(true);
  }

  return (
    <div className="login-card">
      <div className="login-card-body">
        <h1
          style={{
            margin: "0 0 6px",
            font: "600 20px var(--sans)",
            letterSpacing: "-.02em",
            color: "var(--ink)",
          }}
        >
          Reset hasła
        </h1>
        <p
          style={{
            margin: "0 0 18px",
            fontSize: 13,
            lineHeight: 1.55,
            color: "var(--sub)",
          }}
        >
          Podaj adres e-mail przypisany do konta - wyślemy link do ustawienia
          nowego hasła.
        </p>
        {sent ? (
          <div className="form-confirm">
            Jeśli konto o tym adresie istnieje, wysłaliśmy na nie link do
            zmiany hasła. Sprawdź skrzynkę (także folder spam).
          </div>
        ) : (
          <form className="login-form" onSubmit={onSubmit}>
            <label className="field-label">
              E-mail
              <input
                className="field"
                type="email"
                name="email"
                required
                placeholder="jan@firma.pl"
              />
            </label>
            {notice && <div className="form-confirm">{notice}</div>}
            <button className="login-submit" type="submit" disabled={busy}>
              {busy ? "Wysyłanie…" : "Wyślij link resetujący"}
            </button>
          </form>
        )}
        <p style={{ margin: "16px 0 0", textAlign: "center" }}>
          <Link
            href="/login"
            style={{ fontSize: 12.5, color: "var(--sub)", fontWeight: 600 }}
          >
            ← Wróć do logowania
          </Link>
        </p>
      </div>
    </div>
  );
}
