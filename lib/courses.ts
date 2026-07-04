/**
 * Dane kursów — tymczasowe źródło (Faza 1).
 * W Fazie 2 dane przechodzą do Supabase (courses / course_translations /
 * modules / lessons / course_prices); ten moduł staje się seedem.
 *
 * Decyzja właściciela: kursy bez gotowej treści = 'coming_soon'
 * (widoczne w katalogu, NIE kupowalne). Kupowalny jest tylko BLA-110.
 */

export type CourseStatus = "published" | "coming_soon";
export type CatKey = "izo" | "obmiar" | "blacha" | "dok";

export interface CourseModuleDef {
  title: string;
  desc: string;
}

export interface Course {
  slug: string;
  code: string;
  status: CourseStatus;
  catKey: CatKey;
  catLabel: string;
  title: string;
  desc: string;
  cardMeta: string;
  cardPrice: string;
  priceCents: number;
  currency: "PLN";
  priceLabel: string;
  lessonsLabel: string;
  hoursLabel: string;
  levelLabel: string;
  cardBg: string;
  thumbUrl: string;
  thumbSize: string;
  learnBullets: string[];
  modules: CourseModuleDef[];
  forWhom: string;
}

export const CAT_BREADCRUMB: Record<CatKey, string> = {
  izo: "Podstawy Izolacji",
  obmiar: "Obmiarowanie",
  blacha: "Prefabrykacja",
  dok: "Dokumentacja techniczna",
};

export const CATEGORIES: { key: CatKey | "all"; label: string }[] = [
  { key: "all", label: "Wszystkie" },
  { key: "izo", label: "Podstawy Izolacji" },
  { key: "obmiar", label: "Obmiarowanie" },
  { key: "blacha", label: "Prefabrykacja" },
  { key: "dok", label: "Dokumentacja techniczna" },
];

export const COURSES: Course[] = [
  {
    slug: "izo-101",
    code: "IZO-101",
    status: "coming_soon",
    catKey: "izo",
    catLabel: "PODSTAWY IZOLACJI",
    title: "Podstawy izolacji przemysłowych",
    desc: "Rodzaje izolacji technicznych, dobór materiału i zasady montażu zgodne z praktyką wykonawczą.",
    cardMeta: "12 LEKCJI · 3H 20MIN",
    cardPrice: "199 ZŁ",
    priceCents: 19900,
    currency: "PLN",
    priceLabel: "199 zł",
    lessonsLabel: "12 lekcji",
    hoursLabel: "3 godziny 20 minut materiału",
    levelLabel: "Poziom podstawowy",
    cardBg: "#fff url('/assets/thumb-izo101.png') center / auto 151% no-repeat",
    thumbUrl: "/assets/thumb-izo101.png",
    thumbSize: "auto 151%",
    learnBullets: [
      "Rodzaje izolacji technicznych i ich zastosowanie",
      "Dobór materiału izolacyjnego do warunków pracy instalacji",
      "Zasady montażu zgodne z praktyką wykonawczą",
      "Podstawowe zabezpieczenia przeciwkorozyjne i przeciwwilgociowe",
    ],
    modules: [
      {
        title: "Moduł 1 - Rodzaje izolacji przemysłowych",
        desc: "Izolacje termiczne, akustyczne i przeciwpożarowe stosowane w przemyśle.",
      },
      {
        title: "Moduł 2 - Dobór materiału izolacyjnego",
        desc: "Kryteria doboru w zależności od temperatury pracy i warunków środowiskowych.",
      },
      {
        title: "Moduł 3 - Zasady montażu",
        desc: "Kolejność prac, mocowania i typowe błędy wykonawcze.",
      },
      {
        title: "Moduł 4 - Kontrola jakości wykonania",
        desc: "Odbiór robót izolacyjnych i dokumentacja powykonawcza.",
      },
    ],
    forWhom:
      "Dla monterów rozpoczynających pracę w branży izolacji przemysłowej oraz osób przygotowujących się do pierwszych samodzielnych realizacji.",
  },
  {
    slug: "obm-210",
    code: "OBM-210",
    status: "coming_soon",
    catKey: "obmiar",
    catLabel: "OBMIAROWANIE",
    title: "Obmiarowanie izometryczne izolacji przemysłowych",
    desc: "Metodyka obmiaru rurociągów, armatury i zbiorników na podstawie dokumentacji ISO i P&ID - od odczytu rysunku do gotowego zestawienia obmiarowego.",
    cardMeta: "18 LEKCJI · 5H",
    cardPrice: "449 ZŁ",
    priceCents: 44900,
    currency: "PLN",
    priceLabel: "449 zł",
    lessonsLabel: "18 lekcji",
    hoursLabel: "5 godzin materiału",
    levelLabel: "Poziom średnio zaawansowany",
    cardBg: "#fff url('/assets/thumb-obm210.jpg') center / cover no-repeat",
    thumbUrl: "/assets/thumb-obm210.jpg",
    thumbSize: "cover",
    learnBullets: [
      "Czytanie rysunków izometrycznych i schematów P&ID",
      "Obmiar rurociągów, armatury i zbiorników",
      "Przygotowanie zestawienia obmiarowego",
      "Weryfikację obmiaru na etapie realizacji",
    ],
    modules: [
      {
        title: "Moduł 1 - Podstawy dokumentacji ISO i P&ID",
        desc: "Struktura rysunków izometrycznych i schematów procesowych, oznaczenia i skale stosowane w dokumentacji przemysłowej.",
      },
      {
        title: "Moduł 2 - Obmiar rurociągów",
        desc: "Zasady liczenia długości, kolan, redukcji i armatury na podstawie izometrii.",
      },
      {
        title: "Moduł 3 - Obmiar zbiorników i aparatów",
        desc: "Metody obmiaru powierzchni płaszczy, den i króćców na zbiornikach oraz aparatach.",
      },
      {
        title: "Moduł 4 - Zestawienie obmiarowe",
        desc: "Przygotowanie czytelnego zestawienia obmiarowego gotowego do kosztorysu.",
      },
    ],
    forWhom:
      "Dla obmiarowców, kosztorysantów, planistów i monterów izolacji, którzy chcą samodzielnie przygotowywać i weryfikować obmiary na podstawie dokumentacji technicznej.",
  },
  {
    slug: "bla-110",
    code: "BLA-110",
    status: "published",
    catKey: "blacha",
    catLabel: "PREFABRYKACJA",
    title: "Rozwiązania blacharskie płaszczy ochronnych",
    desc: "Wykonywanie rozwinięć blacharskich, kształtek i płaszczy ochronnych zgodnie z dokumentacją wykonawczą.",
    cardMeta: "15 LEKCJI · 4H",
    cardPrice: "349 ZŁ",
    priceCents: 34900,
    currency: "PLN",
    priceLabel: "349 zł",
    lessonsLabel: "15 lekcji",
    hoursLabel: "4 godziny materiału",
    levelLabel: "Poziom podstawowy",
    cardBg: "#fff url('/assets/thumb-bla110-v3.png') center / auto 115% no-repeat",
    thumbUrl: "/assets/thumb-bla110-v3.png",
    thumbSize: "auto 115%",
    learnBullets: [
      "Wykonywanie rozwinięć blacharskich na typowych kształtkach",
      "Dobór blachy i grubości płaszcza ochronnego",
      "Łączenia i uszczelnienia płaszczy ochronnych",
      "Zabezpieczenia antykorozyjne blachy",
    ],
    modules: [
      {
        title: "Moduł 1 - Rozwinięcia blacharskie",
        desc: "Metody rozwijania walców, stożków i kolan.",
      },
      {
        title: "Moduł 2 - Dobór blachy i grubości płaszcza",
        desc: "Kryteria doboru materiału w zależności od średnicy i lokalizacji.",
      },
      {
        title: "Moduł 3 - Łączenia i uszczelnienia",
        desc: "Zakłady, nity, wkręty i uszczelnienia płaszczy ochronnych.",
      },
      {
        title: "Moduł 4 - Zabezpieczenia antykorozyjne",
        desc: "Dobór powłok i zabezpieczeń w środowiskach agresywnych.",
      },
    ],
    forWhom:
      "Dla blacharzy izolacyjnych i monterów wykonujących płaszcze ochronne na rurociągach, zbiornikach i aparatach.",
  },
  {
    slug: "izo-330",
    code: "IZO-330",
    status: "coming_soon",
    catKey: "obmiar",
    catLabel: "OBMIAROWANIE",
    title: "SketchUp dla obmiarowców izolacji przemysłowej",
    desc: "Modelowanie 3D w SketchUp na potrzeby obmiaru izolacji przemysłowych - budowa modeli rurociągów i zbiorników do szybkiego i dokładnego wyliczania powierzchni.",
    cardMeta: "10 LEKCJI · 2H 45MIN",
    cardPrice: "299 ZŁ",
    priceCents: 29900,
    currency: "PLN",
    priceLabel: "299 zł",
    lessonsLabel: "10 lekcji",
    hoursLabel: "2 godziny 45 minut materiału",
    levelLabel: "Poziom średnio zaawansowany",
    cardBg:
      "#fff url('/assets/thumb-izo330-sketchup.png') center / auto 174% no-repeat",
    thumbUrl: "/assets/thumb-izo330-sketchup.png",
    thumbSize: "auto 174%",
    learnBullets: [
      "Budowa modeli 3D rurociągów i zbiorników w SketchUp",
      "Wykorzystanie wtyczek do automatycznego liczenia powierzchni izolacji",
      "Eksport zestawień obmiarowych z modelu",
      "Aktualizację modelu na podstawie zmian w dokumentacji",
    ],
    modules: [
      {
        title: "Moduł 1 - Podstawy SketchUp dla obmiaru",
        desc: "Interfejs, narzędzia i organizacja modelu.",
      },
      {
        title: "Moduł 2 - Modelowanie rurociągów i armatury",
        desc: "Budowa geometrii na podstawie izometrii.",
      },
      {
        title: "Moduł 3 - Modelowanie zbiorników i aparatów",
        desc: "Odwzorowanie płaszczy, den i króćców.",
      },
      {
        title: "Moduł 4 - Obliczanie powierzchni izolacji",
        desc: "Wtyczki obmiarowe i eksport wyników.",
      },
    ],
    forWhom:
      "Dla obmiarowców i kosztorysantów, którzy chcą przyspieszyć obmiar dzięki modelowaniu 3D zamiast liczenia ręcznego z rysunków.",
  },
  {
    slug: "rys-110",
    code: "RYS-110",
    status: "coming_soon",
    catKey: "dok",
    catLabel: "DOKUMENTACJA TECHNICZNA",
    title: "Rysunki techniczne w izolacji przemysłowej (ISO, P&ID, GA)",
    desc: "Interpretacja rysunków izometrycznych, schematów P&ID oraz rysunków ogólnych (GA) stosowanych przy realizacji robót.",
    cardMeta: "11 LEKCJI · 3H",
    cardPrice: "249 ZŁ",
    priceCents: 24900,
    currency: "PLN",
    priceLabel: "249 zł",
    lessonsLabel: "11 lekcji",
    hoursLabel: "3 godziny materiału",
    levelLabel: "Poziom średnio zaawansowany",
    cardBg: "#fff url('/assets/thumb-rys110.jpg') center / auto 165% no-repeat",
    thumbUrl: "/assets/thumb-rys110.jpg",
    thumbSize: "cover",
    learnBullets: [
      "Czytanie rysunków izometrycznych (ISO)",
      "Interpretację schematów technologicznych P&ID",
      "Analizę rysunków ogólnych (GA) instalacji",
      "Identyfikację elementów podlegających izolacji na dokumentacji",
    ],
    modules: [
      {
        title: "Moduł 1 - Rysunki izometryczne (ISO)",
        desc: "Oznaczenia, skale i odczyt tras rurociągów.",
      },
      {
        title: "Moduł 2 - Schematy P&ID",
        desc: "Symbole armatury, urządzeń i instrumentacji.",
      },
      {
        title: "Moduł 3 - Rysunki ogólne (GA)",
        desc: "Rozmieszczenie instalacji i powiązania międzybranżowe.",
      },
      {
        title: "Moduł 4 - Dokumentacja wykonawcza",
        desc: "Weryfikacja zgodności rysunków z realizacją.",
      },
    ],
    forWhom:
      "Dla monterów, obmiarowców i planistów, którzy na co dzień pracują z dokumentacją techniczną projektów przemysłowych.",
  },
];

export function getCourse(slug: string): Course | undefined {
  return COURSES.find((c) => c.slug === slug);
}

export function isPurchasable(course: Course): boolean {
  return course.status === "published";
}
