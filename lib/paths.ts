/**
 * Ścieżki kariery (pakiety kursów) — cennik właściciela z 2026-07.
 *
 * Model sprzedaży: zakup ścieżki = jedno zamówienie (orders.bundle_id),
 * które po opłaceniu tworzy enrollment DLA KAŻDEGO kursu ścieżki
 * (12 miesięcy dostępu każdy). Tabele: bundles / bundle_courses /
 * bundle_prices w migracji 0001. Seed w Fazie 2.
 *
 * Status: ścieżki wchodzą do sprzedaży dopiero, gdy WSZYSTKIE kursy
 * składowe mają gotową treść — do tego czasu 'coming_soon'.
 */

export interface CareerPath {
  slug: string;
  name: string;
  levelLabel: string;
  /** Jednozdaniowa zajawka do kafelka (strategia marketingowa). */
  teaser: string;
  courseSlugs: string[];
  priceCents: number;
  priceLabel: string;
  /** Suma cen kursów kupowanych osobno (przekreślona na kafelku). */
  compareAtCents?: number;
  compareAtLabel?: string;
  savingsLabel?: string;
  badge?: string;
  /** Ilustracja kafelka (HQ, bez wtopionych plakietek). Gdy ustawiona —
   *  zastępuje gradient z watermarkiem; plakietka badge nakładana osobno. */
  imageUrl?: string;
  status: "published" | "coming_soon";
}

export const CAREER_PATHS: CareerPath[] = [
  {
    slug: "izoler",
    name: "Izoler",
    imageUrl: "/assets/path-izoler.jpg",
    levelLabel: "POZIOM PODSTAWOWY",
    teaser:
      "Pewny start w zawodzie - podstawy izolacji przemysłowych, od doboru materiału po poprawny montaż.",
    courseSlugs: ["izo-101"],
    priceCents: 19900,
    priceLabel: "199 zł",
    status: "coming_soon",
  },
  {
    slug: "warsztatowiec",
    name: "Warsztatowiec",
    imageUrl: "/assets/path-warsztatowiec.jpg",
    levelLabel: "POZIOM ŚREDNIO ZAAWANSOWANY",
    teaser:
      "Prefabrykacja i płaszcze ochronne - czytasz rysunki techniczne i wykonujesz rozwinięcia blacharskie jak specjalista.",
    courseSlugs: ["izo-101", "rys-110", "bla-110"],
    priceCents: 59900,
    priceLabel: "599 zł",
    compareAtCents: 79700,
    compareAtLabel: "797 zł",
    savingsLabel: "Oszczędzasz 198 zł",
    status: "coming_soon",
  },
  {
    slug: "obmiarowiec",
    name: "Obmiarowiec",
    imageUrl: "/assets/path-obmiarowiec.jpg",
    levelLabel: "POZIOM ZAAWANSOWANY",
    teaser:
      "Przygotowanie do roli Insulation Surveyor - izometria, SketchUp i obmiar, czyli kompetencje, na których zarabia się najlepiej.",
    courseSlugs: ["rys-110", "izo-330", "obm-210"],
    priceCents: 74900,
    priceLabel: "749 zł",
    compareAtCents: 99700,
    compareAtLabel: "997 zł",
    savingsLabel: "Oszczędzasz 248 zł",
    badge: "POLECANA",
    status: "coming_soon",
  },
  {
    slug: "brygadzista",
    name: "Brygadzista",
    imageUrl: "/assets/path-brygadzista.jpg",
    levelLabel: "POZIOM ZAAWANSOWANY",
    teaser:
      "Kompetencje do nadzorowania robót - od dokumentacji ISO/P&ID, przez blacharkę, po kontrolę obmiaru wykonawczego.",
    courseSlugs: ["izo-101", "rys-110", "bla-110", "obm-210"],
    priceCents: 89900,
    priceLabel: "899 zł",
    compareAtCents: 124600,
    compareAtLabel: "1246 zł",
    savingsLabel: "Oszczędzasz 347 zł",
    status: "coming_soon",
  },
  {
    slug: "pelna-akademia",
    name: "Pełna Akademia",
    imageUrl: "/assets/path-pelna-akademia.jpg",
    levelLabel: "KOMPLET",
    teaser:
      "Cała wiedza ekspercka w jednym pakiecie - najlepszy wybór, jeśli chcesz mieć dostęp do wszystkiego.",
    courseSlugs: ["izo-101", "rys-110", "izo-330", "bla-110", "obm-210"],
    priceCents: 109900,
    priceLabel: "1099 zł",
    compareAtCents: 154500,
    compareAtLabel: "1545 zł",
    savingsLabel: "Oszczędzasz 446 zł",
    badge: "NAJLEPSZA WARTOŚĆ",
    status: "coming_soon",
  },
];

export function pathCoursesCountLabel(n: number): string {
  if (n === 1) return "1 KURS";
  if (n >= 2 && n <= 4) return `${n} KURSY`;
  return `${n} KURSÓW`;
}

export function getCareerPath(slug: string): CareerPath | undefined {
  return CAREER_PATHS.find((p) => p.slug === slug);
}

/** Największa oszczędność wśród ścieżek — do nagłówka sekcji. */
export function maxSavingsLabel(): string {
  const max = Math.max(
    ...CAREER_PATHS.map((p) =>
      p.compareAtCents ? p.compareAtCents - p.priceCents : 0
    )
  );
  return `${Math.round(max / 100)} zł`;
}
