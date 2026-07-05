"use client";

import Link from "next/link";
import { useState } from "react";
import { CATEGORIES, COURSES, type CatKey } from "@/lib/courses";
import type { OwnState } from "@/lib/enrollment-state";

/**
 * Siatka katalogu. Dla zalogowanego kursanta karty pokazują stan
 * posiadania: aktywny dostęp (zielona pigułka „MASZ DOSTĘP", link do
 * panelu kursu) lub wygasły („DOSTĘP WYGASŁ", link do odnowienia).
 */
export default function CatalogGrid({
  states,
}: {
  states: Record<string, OwnState>;
}) {
  const [filter, setFilter] = useState<CatKey | "all">("all");

  return (
    <>
      <div className="catalog-filter-row">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            className={`chip${filter === c.key ? " active" : ""}`}
            onClick={() => setFilter(c.key)}
          >
            {c.label}
          </button>
        ))}
        <span className="catalog-sort">SORTUJ: POPULARNE ▾</span>
      </div>
      <div className="catalog-grid">
        {COURSES.filter((c) => filter === "all" || c.catKey === filter).map(
          (c) => {
            const state = states[c.slug];
            const href =
              state === "active"
                ? `/dashboard/courses/${c.slug}`
                : `/courses/${c.slug}`;
            return (
              <Link key={c.slug} className="course-card kcard" href={href}>
                <div className="cc-head" style={{ background: c.cardBg }}>
                  {c.code === "OBM-210" && !state && (
                    <span className="cc-badge">BESTSELLER</span>
                  )}
                  {state === "active" && (
                    <span
                      className="cc-badge"
                      style={{ background: "#2E7D46" }}
                    >
                      MASZ DOSTĘP
                    </span>
                  )}
                  {state === "expired" && (
                    <span className="cc-badge">DOSTĘP WYGASŁ</span>
                  )}
                </div>
                <div className="cc-body">
                  <div className="cc-cat">{c.catLabel}</div>
                  <div className="cc-title">{c.title}</div>
                  <div className="cc-desc">{c.desc}</div>
                  <div className="cc-foot">
                    <span className="cc-meta">{c.cardMeta}</span>
                    {state === "active" ? (
                      <span
                        className="cc-price"
                        style={{ color: "#2E7D46" }}
                      >
                        PRZEJDŹ →
                      </span>
                    ) : state === "expired" ? (
                      <span
                        className="cc-price"
                        style={{ color: "var(--accent)" }}
                      >
                        ODNÓW
                      </span>
                    ) : (
                      <span className="cc-price">{c.cardPrice}</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          }
        )}
      </div>
    </>
  );
}
