import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

/* eslint-disable @next/next/no-img-element */

export const metadata: Metadata = {
  title: "Dla firm - MARKOWE KURSY",
  description:
    "Grupowe licencje, programy dopasowane do realizowanych projektów i faktury VAT dla firm wykonawczych. Podnieś kompetencje całego zespołu.",
};

export default function DlaFirmPage() {
  return (
    <>
      <SiteHeader active="dla-firm" />

      {/* HERO */}
      <section className="b2b-hero">
        <img
          className="b2b-hero-bg"
          src="/assets/dla-firm-hero.jpg"
          alt="Projekt techniczny i instalacja przemysłowa"
        />
        <div className="b2b-hero-scrim"></div>
        <div className="b2b-hero-inner">
          <div className="b2b-hero-content">
            <div className="hero-kicker-row">
              <span className="hero-kicker-line"></span>
              <span className="hero-kicker">DLA FIRM</span>
            </div>
            <h1>Podnieś kompetencje całego zespołu wykonawczego</h1>
            <p className="b2b-hero-para">
              <span className="d-only">
                Grupowe licencje, programy dopasowane do realizowanych projektów
                i faktury VAT dla firm wykonawczych.
              </span>
              <span className="m-only">
                Grupowe licencje i faktury VAT dla firm wykonawczych.
              </span>
            </p>
            <div>
              <Link className="btn btn-primary-lg" href="/kontakt">
                Zapytaj o ofertę
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CO ZYSKUJESZ */}
      <section className="b2b-value">
        <div className="wrap">
          <div className="kicker-row">
            <span className="kicker-line"></span>
            <span className="kicker">CO ZYSKUJESZ</span>
          </div>
          <h2 className="section-h2">Szkolenia dopasowane do pracy zespołu</h2>
          <div className="check-grid check-grid-light">
            <span>
              <b>✔</b>Indywidualny program szkoleniowy dopasowany do projektów
              firmy
            </span>
            <span>
              <b>✔</b>Licencje grupowe dla całych zespołów wykonawczych
            </span>
            <span>
              <b>✔</b>Raportowanie postępów szkolenia dla kierownictwa
            </span>
            <span>
              <b>✔</b>Faktury VAT i rozliczenia dla firm
            </span>
            <span>
              <b>✔</b>Dedykowany opiekun kontraktu
            </span>
            <span>
              <b>✔</b>Elastyczne terminy dopasowane do harmonogramu robót
            </span>
          </div>
        </div>
      </section>

      {/* PROCES */}
      <section className="b2b-process">
        <div className="wrap">
          <div className="kicker-row">
            <span className="kicker-line"></span>
            <span className="kicker">PROCES</span>
          </div>
          <h2 className="section-h2">Jak zaczynamy współpracę</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-num">01</div>
              <div className="step-title">Rozmowa o potrzebach</div>
              <div className="step-desc">
                Ustalamy zakres prac zespołu i braki kompetencyjne do
                uzupełnienia.
              </div>
            </div>
            <div className="step-card">
              <div className="step-num">02</div>
              <div className="step-title">Dobór programu i licencji</div>
              <div className="step-desc">
                Przygotowujemy zestaw kursów i model rozliczenia dla całego
                zespołu.
              </div>
            </div>
            <div className="step-card">
              <div className="step-num">03</div>
              <div className="step-title">Szkolenie i raportowanie</div>
              <div className="step-desc">
                Zespół realizuje kursy, a Ty otrzymujesz raport postępów i certyfikaty.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="b2b-cta">
        <div className="b2b-cta-inner">
          <div>
            <h2>Porozmawiajmy o Twoim zespole</h2>
            <p>Odpowiadamy na zapytania firmowe w ciągu 1 dnia roboczego.</p>
          </div>
          <Link className="btn btn-primary-lg" href="/kontakt">
            Zapytaj o ofertę
          </Link>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
