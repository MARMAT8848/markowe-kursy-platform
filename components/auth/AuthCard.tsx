"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/client";

/**
 * Logowanie / rejestracja — Supabase Auth (na żywo).
 * Rejestracja wymaga imienia i nazwiska (potrzebne do certyfikatu)
 * i potwierdzenia adresu e-mail (link aktywacyjny).
 */
export default function AuthCard({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const [notice, setNotice] = useState<string | null>(
    searchParams.get("error") === "confirmation"
      ? "Link potwierdzający wygasł lub jest nieprawidłowy. Zaloguj się lub zarejestruj ponownie."
      : null
  );
  const [busy, setBusy] = useState(false);

  async function onLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setNotice(null);
    const form = new FormData(e.currentTarget);
    const supabase = createSupabaseBrowser();
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    if (error) {
      setNotice(
        error.message.includes("Invalid login credentials")
          ? "Nieprawidłowy e-mail lub hasło."
          : error.message.includes("Email not confirmed")
            ? "Konto nie zostało jeszcze potwierdzone - kliknij link z e-maila."
            : "Nie udało się zalogować. Spróbuj ponownie."
      );
      setBusy(false);
      return;
    }
    router.push(next);
    router.refresh();
  }

  async function onRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setNotice(null);
    const form = new FormData(e.currentTarget);
    const supabase = createSupabaseBrowser();
    const { error } = await supabase.auth.signUp({
      email: String(form.get("email")),
      password: String(form.get("password")),
      options: {
        data: { full_name: String(form.get("full_name")) },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    setBusy(false);
    if (error) {
      setNotice(
        error.message.includes("already registered")
          ? "Konto z tym adresem już istnieje - zaloguj się."
          : error.message.toLowerCase().includes("password")
            ? "Hasło musi mieć co najmniej 8 znaków."
            : "Nie udało się założyć konta. Spróbuj ponownie."
      );
      return;
    }
    setNotice(
      "Konto utworzone. Sprawdź skrzynkę e-mail i kliknij link potwierdzający, aby dokończyć rejestrację."
    );
  }

  const tabStyle = { textDecoration: "none", textAlign: "center" as const };

  return (
    <div className="login-card">
      <div className="login-tabs">
        <Link
          className={`login-tab${mode === "login" ? " active" : ""}`}
          href="/login"
          style={tabStyle}
        >
          Zaloguj się
        </Link>
        <Link
          className={`login-tab${mode === "register" ? " active" : ""}`}
          href="/register"
          style={tabStyle}
        >
          Załóż konto
        </Link>
      </div>
      <div className="login-card-body">
        {mode === "login" ? (
          <form className="login-form" onSubmit={onLogin}>
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
            <label className="field-label">
              Hasło
              <input
                className="field"
                type="password"
                name="password"
                required
                placeholder="••••••••"
              />
            </label>
            <div className="login-forgot-row">
              <Link href="/forgot-password">Zapomniałeś hasła?</Link>
            </div>
            {notice && <div className="form-confirm">{notice}</div>}
            <button className="login-submit" type="submit" disabled={busy}>
              {busy ? "Logowanie…" : "Zaloguj się"}
            </button>
          </form>
        ) : (
          <form className="login-form" onSubmit={onRegister}>
            <label className="field-label">
              Imię i nazwisko
              <input
                className="field"
                type="text"
                name="full_name"
                required
                placeholder="Jan Kowalski"
              />
            </label>
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
            <label className="field-label">
              Hasło
              <input
                className="field"
                type="password"
                name="password"
                required
                minLength={8}
                placeholder="min. 8 znaków"
              />
            </label>
            {notice && <div className="form-confirm">{notice}</div>}
            <button className="login-submit" type="submit" disabled={busy}>
              {busy ? "Tworzenie konta…" : "Załóż konto"}
            </button>
            <p className="login-fineprint">
              Zakładając konto akceptujesz{" "}
              <Link
                href="/regulamin"
                style={{ color: "var(--sub)", fontWeight: 600 }}
              >
                regulamin
              </Link>{" "}
              i{" "}
              <Link
                href="/polityka-prywatnosci"
                style={{ color: "var(--sub)", fontWeight: 600 }}
              >
                politykę prywatności
              </Link>
              .
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
