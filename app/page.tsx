import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CareerPaths from "@/components/home/CareerPaths";
import FeaturedCourses from "@/components/home/FeaturedCourses";
import LearnAnywhere from "@/components/home/LearnAnywhere";
import Faq from "@/components/home/Faq";

/* eslint-disable @next/next/no-img-element */

export default function HomePage() {
  return (
    <>
      <SiteHeader active="kursy" />

      {/* HERO */}
      <section className="hero">
        <img
          className="hero-bg"
          src="/assets/baner-2a.png"
          alt="Instalacja przemysłowa"
        />
        <div className="hero-scrim"></div>
        <div className="hero-inner">
          <div className="hero-content">
            <div className="hero-kicker-row">
              <span className="hero-kicker-line"></span>
              <span className="hero-kicker">
                <span className="d-only">
                  AKADEMIA TECHNICZNA MARKOWE KURSY
                </span>
                <span className="m-only">AKADEMIA TECHNICZNA</span>
              </span>
            </div>
            <h1>Zbuduj karierę jako ekspert izolacji zgodnie z NORSOK Standard</h1>
            <p className="hero-para">
              Wybierz jedną z 5 ścieżek kariery - od pierwszego montażu po
              samodzielne obmiary na projektach w Norwegii.
            </p>
            <div className="hero-btns">
              <Link className="btn btn-primary-lg" href="/courses">
                Zobacz kursy
              </Link>
              <Link className="btn btn-ghost-lg" href="/dla-firm">
                Oferta dla firm
              </Link>
            </div>
            <div className="hero-checks">
              <span>
                <b>✓</b>Kursy oparte na rzeczywistych projektach
              </span>
              <span>
                <b>✓</b>Dostęp przez 12 miesięcy
              </span>
              <span>
                <b>✓</b>Certyfikat ukończenia
              </span>
              <span>
                <b>✓</b>Materiały do pobrania
              </span>
              <span>
                <b>✓</b>Aktualizowane treści
              </span>
              <span>
                <b>✓</b>Nauka kiedy chcesz
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ŚCIEŻKI KARIERY — główny blok ofertowy */}
      <CareerPaths />

      {/* POLECANE SZKOLENIA */}
      <FeaturedCourses />

      {/* UCZ SIĘ, GDZIEKOLWIEK JESTEŚ — zbicie obiekcji (rotacja/delegacja) */}
      <LearnAnywhere />

      {/* SEPARATOR: AKADEMIA TECHNICZNA */}
      <section className="separator">
        <img
          className="separator-bg"
          src="/assets/separator-technologia.png"
          alt="Projekt techniczny i instalacja przemysłowa"
        />
        <div className="separator-scrim"></div>
        <div className="separator-scrim-top"></div>
        <div className="separator-inner">
          <div className="separator-content">
            <div className="separator-kicker-row">
              <span className="hero-kicker-line"></span>
              <span className="hero-kicker">AKADEMIA TECHNICZNA</span>
            </div>
            <h2>
              <span className="d-only">
                Wiedza tworzona przez praktyków.
                <br />
                Dla ludzi, którzy chcą rozwijać się w branży izolacji
                przemysłowych.
              </span>
              <span className="m-only">Wiedza tworzona przez praktyków.</span>
            </h2>
            <p className="separator-para">
              <span className="d-only">
                Projektujemy szkolenia na podstawie rzeczywistych doświadczeń
                zdobytych na największych inwestycjach przemysłowych. Bez
                zbędnej teorii. Tylko wiedza, którą wykorzystasz w pracy.
              </span>
              <span className="m-only">
                Projektujemy szkolenia na podstawie rzeczywistych doświadczeń
                zdobytych na największych inwestycjach przemysłowych.
              </span>
            </p>
            <Link className="separator-btn" href="/o-nas">
              Poznaj Akademię
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <Faq />

      {/* DLACZEGO WARTO? */}
      <section className="why-section">
        <div className="wrap">
          <div className="kicker-row">
            <span className="kicker-line"></span>
            <span className="kicker">DLACZEGO WARTO?</span>
          </div>
          <h2>Zostań specjalistą, którego szuka branża.</h2>
          <div className="check-grid">
            <span>
              <b>✔</b>Oparte na rzeczywistych projektach przemysłowych
            </span>
            <span>
              <b>✔</b>Wiedza od praktyków z wieloletnim doświadczeniem
            </span>
            <span>
              <b>✔</b>Materiały przygotowane specjalnie dla branży izolacji
            </span>
            <span>
              <b>✔</b>Dostęp 24/7 z każdego urządzenia
            </span>
            <span>
              <b>✔</b>Certyfikat ukończenia
            </span>
            <span>
              <b>✔</b>Regularnie aktualizowane materiały
            </span>
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

      <SiteFooter />
    </>
  );
}
