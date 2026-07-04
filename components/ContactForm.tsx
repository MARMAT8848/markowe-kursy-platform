"use client";

import { useState } from "react";

/**
 * Formularz kontaktowy — stan sukcesu po stronie klienta (jak w projekcie).
 * Realna wysyłka (Resend) — Faza 6.
 */
export default function ContactForm() {
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <form className="kontakt-form" onSubmit={onSubmit}>
      <div className="form-row">
        <label className="field-label">
          Imię i nazwisko
          <input
            className="field"
            type="text"
            name="name"
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
          placeholder="Opisz, w czym możemy pomóc"
        ></textarea>
      </label>
      <div>
        {sent ? (
          <div className="form-confirm">
            Dziękujemy - wiadomość została wysłana.
          </div>
        ) : (
          <button className="form-submit" type="submit">
            Wyślij wiadomość
          </button>
        )}
      </div>
    </form>
  );
}
