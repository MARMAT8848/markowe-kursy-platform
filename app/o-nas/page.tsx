import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

/* eslint-disable @next/next/no-img-element */

export const metadata: Metadata = {
  title: "O nas - MARKOWE KURSY",
  description:
    "Akademia techniczna zbudowana przez praktyków branży izolacyjnej. Programy szkoleniowe powstają na bazie realnych projektów przemysłowych.",
};

export default function ONasPage() {
  return (
    <>
      <SiteHeader active="o-nas" />

      {/* INTRO */}
      <section className="onas-intro">
        <div className="wrap">
          <div className="kicker-row">
            <span className="kicker-line"></span>
            <span className="kicker">O NAS</span>
          </div>
          <h1>
            Akademia techniczna zbudowana przez praktyków branży izolacyjnej
          </h1>
          <p>
            <span className="d-only">
              Programy szkoleniowe MARKOWE KURSY powstają na bazie realnych
              projektów przemysłowych - nie teorii z podręcznika. Uczymy tego,
              co faktycznie przyda się na budowie, w biurze technicznym i przy
              kosztorysie.
            </span>
            <span className="m-only">
              Programy szkoleniowe MARKOWE KURSY powstają na bazie realnych
              projektów przemysłowych, nie teorii z podręcznika.
            </span>
          </p>
        </div>
      </section>

      {/* MISJA */}
      <section className="onas-misja">
        <div className="wrap">
          <div className="onas-misja-grid">
            <div>
              <div className="kicker-row">
                <span className="kicker-line"></span>
                <span className="kicker">MISJA</span>
              </div>
              <h2>Praktyczna wiedza zamiast ogólników</h2>
              <p className="onas-misja-text">
                <span className="d-only">
                  Rynek izolacji przemysłowej zmienia się szybciej niż programy
                  nauczania. Dlatego inspektorzy FROSIO, obmiarowcy z
                  wieloletnim stażem, brygadziści i kierownicy realizacji
                  projektują treści kursów - a materiały aktualizujemy wraz ze
                  zmianami norm i technologii.
                </span>
                <span className="m-only">
                  Rynek izolacji przemysłowej zmienia się szybciej niż programy
                  nauczania. Dlatego inspektorzy FROSIO, obmiarowcy z
                  wieloletnim stażem, brygadziści i kierownicy realizacji
                  projektują treści kursów.
                </span>
              </p>
            </div>
            <div className="onas-points">
              <div className="onas-point">
                <span className="onas-point-tile">✔</span>
                <div>
                  <div className="onas-point-title">
                    Programy tworzone przez praktyków
                  </div>
                  <div className="onas-point-sub">
                    Inspektorzy FROSIO i kierownicy realizacji projektują treści
                    kursów.
                  </div>
                </div>
              </div>
              <div className="onas-point">
                <span className="onas-point-tile">✔</span>
                <div>
                  <div className="onas-point-title">
                    Materiały z realnych projektów
                  </div>
                  <div className="onas-point-sub">
                    Dokumentacja, rysunki i procedury pochodzą z rzeczywistych
                    realizacji.
                  </div>
                </div>
              </div>
              <div className="onas-point">
                <span className="onas-point-tile">✔</span>
                <div>
                  <div className="onas-point-title">
                    Regularna aktualizacja treści
                  </div>
                  <div className="onas-point-sub">
                    Kursy nadążają za zmianami norm, materiałów i technologii
                    montażu.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PASEK WIARYGODNOŚCI */}
      <section className="statband">
        <img
          className="statband-bg"
          src="/assets/separator-band.jpg"
          alt="Instalacja przemysłowa i rysunek techniczny"
        />
        <div className="statband-scrim"></div>
        <div className="statband-inner">
          <div className="statband-cell">
            <div className="statband-num accent">+20 lat</div>
            <div className="statband-caption">
              doświadczenia w branży izolacji przemysłowej
            </div>
          </div>
          <div className="statband-cell">
            <div className="statband-num">Eksperci</div>
            <div className="statband-caption">
              branżowi i inspektorzy FROSIO tworzą programy kursów
            </div>
          </div>
          <div className="statband-cell">
            <div className="statband-num">Praktyka</div>
            <div className="statband-caption">
              kursy oparte na realnych projektach przemysłowych
            </div>
          </div>
        </div>
      </section>

      {/* FILOZOFIA */}
      <section className="filozofia">
        <img
          src="/assets/onas-infografika.png"
          alt="Filozofia Markowych Kursów: dokumentacja techniczna, obmiary, realne projekty, doświadczenie praktyków, aktualne normy, rozwój kompetencji"
        />
        <div className="filozofia-overlay">
          <div className="kicker-row">
            <span className="kicker-line"></span>
            <span className="kicker">FILOZOFIA</span>
          </div>
          <h2>Jak podchodzimy do tworzenia kursów</h2>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
