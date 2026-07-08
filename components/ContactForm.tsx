"use client";

import { useState } from "react";

/**
 * Formularz kontaktowy - realna wysyłka do /api/contact (zapis w bazie
 * + powiadomienie e-mail dla admina). Honeypot odsiewa boty.
 */
export default function ContactForm() {
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">(
    "idle"
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "busy") return;
    setState("busy");
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("send_failed");
      setState("done");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="form-confirm">
        Dziękujemy - wiadomość dotarła. Odpowiemy na podany adres e-mail,
        zwykle w ciągu 1-2 dni roboczych.
      </div>
    );
  }

  return (
    <form className="kontakt-form" onSubmit={onSubmit}>
      {/* Honeypot - niewidoczne dla ludzi, boty je wypełniają */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: -9999, width: 1, height: 1, opacity: 0 }}
      />
      <div className="form-row">
        <label className="field-label">
          Imię i nazwisko
          <input
            className="field"
            type="text"
            name="name"
            required
            maxLength={120}
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
            maxLength={200}
            placeholder="jan@firma.pl"
          />
        </label>
      </div>
      <label className="field-label">
        Temat
        <select className="field" name="topic">
          <option>Kurs indywidualny</option>
          <option>Oferta dla firm</option>
          <option>Inne</option>
        </select>
      </label>
      <label className="field-label">
        Wiadomość
        <textarea
          className="field"
          name="message"
          rows={5}
          required
          maxLength={5000}
          placeholder="Opisz, w czym możemy pomóc"
        ></textarea>
      </label>
      <div>
        {state === "error" && (
          <p style={{ margin: "0 0 10px", fontSize: 13, color: "var(--accent)", fontWeight: 600 }}>
            Nie udało się wysłać wiadomości. Spróbuj ponownie lub napisz
            bezpośrednio na nasz adres e-mail.
          </p>
        )}
        <button className="form-submit" type="submit" disabled={state === "busy"}>
          {state === "busy" ? "Wysyłanie…" : "Wyślij wiadomość"}
        </button>
      </div>
    </form>
  );
}
