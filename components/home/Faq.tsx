"use client";

import { useState } from "react";

const FAQS: { q: string; a: string }[] = [
  {
    q: "Czy kursy kończą się zaświadczeniem?",
    a: "Tak - po ukończeniu kursu otrzymujesz zaświadczenie z numerem, potwierdzające zakres zrealizowanego szkolenia.",
  },
  {
    q: "Ile czasu mam na ukończenie kursu?",
    a: "Dostęp do materiałów szkoleniowych obowiązuje przez 12 miesięcy od zakupu.",
  },
  {
    q: "Czy potrzebuję wcześniejszego doświadczenia?",
    a: "Kursy podstawowe nie wymagają wcześniejszego przygotowania. Kursy średniozaawansowane i zaawansowane zakładają znajomość materiału z poziomu podstawowego.",
  },
  {
    q: "Czy wystawiacie faktury dla firm?",
    a: "Tak. Wystawiamy faktury oraz przygotowujemy programy szkoleniowe dla zespołów i firm wykonawczych.",
  },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="faq-section">
      <div className="wrap">
        <div className="kicker-row">
          <span className="kicker-line"></span>
          <span className="kicker">FAQ</span>
        </div>
        <h2 className="section-h2">Najczęściej zadawane pytania</h2>
        <div className="accordion" style={{ marginTop: 22 }}>
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className={`acc-item${isOpen ? " open" : ""}`}>
                <button
                  className="acc-head"
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  <span className="acc-q">{f.q}</span>
                  <span className="acc-sign">{isOpen ? "–" : "+"}</span>
                </button>
                <div className="acc-body">
                  <p>{f.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
