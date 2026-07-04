"use client";

import Link from "next/link";
import { useState } from "react";

/**
 * Dane kursów — tymczasowo w kodzie (pilot Fazy 0).
 * W Fazie 2 przenoszone do Supabase (tabele courses / course_translations / course_prices);
 * ten komponent stanie się prezentacyjny i dostanie dane z serwera.
 */
const CATEGORIES = [
  { key: "all", label: "Wszystkie" },
  { key: "izo", label: "Podstawy Izolacji" },
  { key: "obmiar", label: "Obmiarowanie" },
  { key: "blacha", label: "Prefabrykacja" },
  { key: "dok", label: "Dokumentacja techniczna" },
] as const;

type CatKey = (typeof CATEGORIES)[number]["key"];

const COURSES: {
  slug: string;
  cat: Exclude<CatKey, "all">;
  catLabel: string;
  title: string;
  desc: string;
  meta: string;
  price: string;
  thumb: string;
  bestseller?: boolean;
}[] = [
  {
    slug: "izo-101",
    cat: "izo",
    catLabel: "PODSTAWY IZOLACJI",
    title: "Podstawy izolacji przemysłowych",
    desc: "Rodzaje izolacji technicznych, dobór materiału i zasady montażu zgodne z praktyką wykonawczą.",
    meta: "12 LEKCJI · 3H 20MIN",
    price: "490 ZŁ",
    thumb: "#fff url('/assets/thumb-izo101.png') center / auto 151% no-repeat",
  },
  {
    slug: "obm-210",
    cat: "obmiar",
    catLabel: "OBMIAROWANIE",
    title: "Obmiarowanie izometryczne izolacji przemysłowych",
    desc: "Metodyka obmiaru rurociągów, armatury i zbiorników na podstawie dokumentacji ISO i P&ID.",
    meta: "18 LEKCJI · 5H",
    price: "690 ZŁ",
    thumb: "#fff url('/assets/thumb-obm210.jpg') center / cover no-repeat",
    bestseller: true,
  },
  {
    slug: "bla-110",
    cat: "blacha",
    catLabel: "PREFABRYKACJA",
    title: "Rozwiązania blacharskie płaszczy ochronnych",
    desc: "Wykonywanie rozwinięć blacharskich, kształtek i płaszczy ochronnych zgodnie z dokumentacją wykonawczą.",
    meta: "15 LEKCJI · 4H",
    price: "590 ZŁ",
    thumb: "#fff url('/assets/thumb-bla110-v3.png') center / auto 115% no-repeat",
  },
  {
    slug: "izo-330",
    cat: "obmiar",
    catLabel: "OBMIAROWANIE",
    title: "SketchUp dla obmiarowców izolacji przemysłowej",
    desc: "Modelowanie 3D w SketchUp na potrzeby obmiaru izolacji przemysłowych - budowa modeli rurociągów i zbiorników do szybkiego i dokładnego wyliczania powierzchni.",
    meta: "10 LEKCJI · 2H 45MIN",
    price: "450 ZŁ",
    thumb:
      "#fff url('/assets/thumb-izo330-sketchup.png') center / auto 174% no-repeat",
  },
  {
    slug: "rys-110",
    cat: "dok",
    catLabel: "DOKUMENTACJA TECHNICZNA",
    title: "Rysunki techniczne w izolacji przemysłowej (ISO, P&ID, GA)",
    desc: "Interpretacja rysunków izometrycznych, schematów P&ID oraz rysunków ogólnych (GA) stosowanych przy realizacji robót.",
    meta: "11 LEKCJI · 3H",
    price: "390 ZŁ",
    thumb: "#fff url('/assets/thumb-rys110.jpg') center / auto 165% no-repeat",
  },
];

export default function FeaturedCourses() {
  const [filter, setFilter] = useState<CatKey>("all");

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
          {COURSES.filter((c) => filter === "all" || c.cat === filter).map(
            (c) => (
              <Link
                key={c.slug}
                className="course-card"
                href={`/courses/${c.slug}`}
              >
                <div className="cc-head" style={{ background: c.thumb }}>
                  {c.bestseller && <span className="cc-badge">BESTSELLER</span>}
                </div>
                <div className="cc-body">
                  <div className="cc-cat">{c.catLabel}</div>
                  <div className="cc-title">{c.title}</div>
                  <div className="cc-desc">{c.desc}</div>
                  <div className="cc-foot">
                    <span className="cc-meta">{c.meta}</span>
                    <span className="cc-price">{c.price}</span>
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
