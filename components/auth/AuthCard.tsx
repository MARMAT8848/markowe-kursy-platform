"use client";

import Link from "next/link";
import { useState } from "react";

/**
 * Karta logowania/rejestracji — port 1:1 z logowanie.html.
 * Zakładki to osobne trasy (/login, /register). Realna autoryzacja
 * (Supabase Auth) — Faza 2; do tego czasu formularz pokazuje komunikat.
 */
export default function AuthCard({ mode }: { mode: "login" | "register" }) {
  const [notice, setNotice] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNotice(
      "Konta użytkowników zostaną uruchomione wraz ze startem platformy — już wkrótce."
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
          <form className="login-form" onSubmit={onSubmit}>
            <label className="field-label">
              E-mail
              <input
                className="field"
                type="email"
                required
                placeholder="jan@firma.pl"
              />
            </label>
            <label className="field-label">
              Hasło
              <input
                className="field"
                type="password"
                required
                placeholder="••••••••"
              />
            </label>
            <div className="login-forgot-row">
              <a href="#">Zapomniałeś hasła?</a>
            </div>
            {notice && <div className="form-confirm">{notice}</div>}
            <button className="login-submit" type="submit">
              Zaloguj się
            </button>
          </form>
        ) : (
          <form className="login-form" onSubmit={onSubmit}>
            <label className="field-label">
              Imię i nazwisko
              <input
                className="field"
                type="text"
                required
                placeholder="Jan Kowalski"
              />
            </label>
            <label className="field-label">
              E-mail
              <input
                className="field"
                type="email"
                required
                placeholder="jan@firma.pl"
              />
            </label>
            <label className="field-label">
              Hasło
              <input
                className="field"
                type="password"
                required
                placeholder="min. 8 znaków"
              />
            </label>
            {notice && <div className="form-confirm">{notice}</div>}
            <button className="login-submit" type="submit">
              Załóż konto
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
