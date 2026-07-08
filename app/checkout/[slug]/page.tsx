import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CheckoutConsents from "@/components/checkout/CheckoutConsents";
import { getCourse, isPurchasable } from "@/lib/courses";
import { getUserCourseStates } from "@/lib/enrollment-state";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourse(slug);
  return {
    title: course
      ? `Zamówienie: ${course.title} - MARKOWE KURSY`
      : "Zamówienie - MARKOWE KURSY",
  };
}

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();
  if (!isPurchasable(course)) redirect(`/courses/${course.slug}`);

  // Kto ma aktywny dostęp, nie kupuje ponownie — do panelu kursu.
  const state = (await getUserCourseStates())[slug];
  if (state === "active") redirect(`/dashboard/courses/${slug}`);

  return (
    <>
      <SiteHeader />
      <section className="kontakt-head">
        <div className="wrap">
          <div className="kicker-row">
            <span className="kicker-line"></span>
            <span className="kicker">ZAMÓWIENIE</span>
          </div>
          <h1
            style={{
              margin: "0 0 10px",
              font: "600 28px/1.15 var(--sans)",
              letterSpacing: "-.03em",
              color: "var(--ink)",
            }}
          >
            Zgody wymagane przed zakupem
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              lineHeight: 1.55,
              color: "var(--sub)",
              maxWidth: 560,
            }}
          >
            Kupujesz treść cyfrową z natychmiastowym dostępem. Przepisy
            wymagają, abyś przed płatnością świadomie zaakceptował/a poniższe
            oświadczenia - żadne nie jest zaznaczone z góry.
          </p>
        </div>
      </section>
      <section style={{ padding: "36px 0 56px", background: "#fff" }}>
        <div className="wrap">
          <CheckoutConsents
            courseSlug={course.slug}
            courseTitle={course.title}
            priceLabel={course.priceLabel}
          />
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
