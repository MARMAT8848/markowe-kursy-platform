"use client";

import Link from "next/link";
import { useState } from "react";
import { CATEGORIES, COURSES, type CatKey } from "@/lib/courses";

export default function CatalogGrid() {
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
          (c) => (
            <Link
              key={c.slug}
              className="course-card kcard"
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
    </>
  );
}
