import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CatalogGrid from "@/components/course/CatalogGrid";
import { getUserCourseStates } from "@/lib/enrollment-state";

export const metadata: Metadata = {
  title: "Katalog szkoleń — MARKOWE KURSY",
  description:
    "Kompleksowe szkolenia z zakresu izolacji przemysłowych, obmiaru, prefabrykacji płaszczy ochronnych oraz dokumentacji technicznej.",
};

export default async function CoursesPage() {
  const states = await getUserCourseStates();
  return (
    <>
      <SiteHeader variant="catalog" active="kursy" />
      <main className="catalog-main">
        <div className="wrap">
          <div className="catalog-head">
            <div className="kicker-row">
              <span className="kicker-line"></span>
              <span className="kicker">KATALOG SZKOLEŃ</span>
            </div>
            <h1>Kursy dla specjalistów izolacji przemysłowych</h1>
            <p>
              <span className="d-only">
                Kompleksowe szkolenia z zakresu izolacji przemysłowych, obmiaru,
                prefabrykacji płaszczy ochronnych oraz dokumentacji technicznej.
                Programy opracowane przez praktyków dla monterów, obmiarowców,
                planistów, brygadzistów i inżynierów realizujących projekty
                przemysłowe.
              </span>
              <span className="m-only">
                Kompleksowe szkolenia z zakresu izolacji przemysłowych, obmiaru,
                prefabrykacji płaszczy ochronnych oraz dokumentacji technicznej.
              </span>
            </p>
          </div>
          <CatalogGrid states={states} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
