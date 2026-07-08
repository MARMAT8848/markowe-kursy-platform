import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ContactForm from "@/components/ContactForm";

/* eslint-disable @next/next/no-img-element */

export const metadata: Metadata = {
  title: "Kontakt - MARKOWE KURSY",
  description:
    "Napisz w sprawie kursu indywidualnego, oferty dla firmy lub współpracy. Odpowiadamy w ciągu 1 dnia roboczego.",
};

export default function KontaktPage() {
  return (
    <>
      <SiteHeader active="kontakt" />

      <section className="kontakt-head">
        <div className="wrap">
          <div className="kicker-row">
            <span className="kicker-line"></span>
            <span className="kicker">KONTAKT</span>
          </div>
          <h1>Porozmawiajmy o Twoim rozwoju</h1>
          <p>
            <span className="d-only">
              Napisz w sprawie kursu indywidualnego, oferty dla firmy lub
              współpracy. Odpowiadamy w ciągu 1 dnia roboczego.
            </span>
            <span className="m-only">
              Napisz w sprawie kursu, oferty dla firmy lub współpracy.
              Odpowiadamy w ciągu 1 dnia roboczego.
            </span>
          </p>
        </div>
      </section>

      <section className="kontakt-body">
        <div className="wrap">
          <div className="kontakt-grid">
            <ContactForm />
            <div className="kontakt-panel">
              <img src="/assets/logo.png" alt="MARKOWE KURSY" />
              <div className="kontakt-divider"></div>
              <div>
                <div className="kontakt-email-label">E-MAIL</div>
                <div className="kontakt-email">kontakt@markowekursy.pl</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
