"use client";

import Link from "next/link";
import { useState } from "react";
import { CATEGORIES, COURSES, type CatKey } from "@/lib/courses";

/**
 * „Polecane szkolenia" — kursy pojedyncze z filtrem kategorii.
 * Dane z lib/courses.ts (jedno źródło cen); w Fazie 2 → Supabase.
 */
export default function FeaturedCourses() {
  const [filter, setFilter] = useState<CatKey | "all">("all");

  return (
    <section className="featured">
      <div className="wrap">
        <div className="featured-head">
          <div>
            <div className="kicker-row">
              <span className="kicker-line"></span>
              <span className="kicker">POLECANE SZKOLENIA</span>
            </div>
            <h2 className="section-h2">
              <span className="d-only">
                Kursy techniczne dla praktyków branży izolacyjnej
              </span>
              <span className="m-only">Kursy techniczne dla praktyków</span>
            </h2>
          </div>
          <Link className="featured-link d-only" href="/courses">
            Zobacz pełną ofertę →
          </Link>
        </div>
        <div className="chips">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              className={`chip${filter === c.key ? " active" : ""}`}
              onClick={() => setFilter(c.key)}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="course-grid">
          {COURSES.filter((c) => filter === "all" || c.catKey === filter).map(
            (c) => (
              <Link
                key={c.slug}
                className="course-card"
                href={`/courses/${c.slug}`}
              >
                <div className="cc-head" style={{ background: c.cardBg }}>
                  {c.code === "OBM-210" && (
                    <span className="cc-badge">BESTSELLER</span>
                  )}
                </div>
                <div className="cc-body">
                  <div className="cc-cat">{c.catLabel}</div>
                  <div className="cc-title">{c.title}</div>
                  <div className="cc-desc">{c.desc}</div>
                  <div className="cc-foot">
                    <span className="cc-meta">{c.cardMeta}</span>
                    <span className="cc-price">{c.cardPrice}</span>
                  </div>
                </div>
              </Link>
            )
          )}
        </div>
      </div>
    </section>
  );
}
