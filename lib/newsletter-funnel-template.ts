/**
 * Gotowy lejek sprzedażowy "Od pierwszego kontaktu do kursu" — 7 wiadomości
 * ułożonych wg klasycznego modelu TOFU → MOFU → BOFU (góra/środek/dół lejka).
 *
 * TOFU (świadomość): dostarcz wartość, zbuduj zaufanie, nie sprzedawaj.
 * MOFU (rozważanie): edukuj, pokaż transformację i ścieżki, zbijaj obiekcje.
 * BOFU (decyzja): jasna oferta, korzyści, delikatna pilność, wezwanie do zakupu.
 *
 * delayDays = liczba dni od POPRZEDNIEGO kroku. Krok 1 (0 dni) wychodzi od
 * razu po potwierdzeniu zapisu. ctaPath jest względny — akcja seedująca
 * zamienia go na pełny adres produkcyjny.
 */
export interface FunnelStepTemplate {
  delayDays: number;
  stage: "TOFU" | "MOFU" | "BOFU";
  subject: string;
  preheader: string;
  content: string;
  ctaLabel: string;
  ctaPath: string;
}

export const FUNNEL_TEMPLATE: {
  name: string;
  description: string;
  steps: FunnelStepTemplate[];
} = {
  name: "Lejek powitalny: od zapisu do kursu",
  description:
    "7 wiadomości TOFU → MOFU → BOFU. Buduje relację i wiedzę, a na końcu prowadzi do zakupu kursu. Startuje automatycznie po potwierdzeniu zapisu.",
  steps: [
    // ---------- TOFU: świadomość + wartość ----------
    {
      delayDays: 0,
      stage: "TOFU",
      subject: "Witaj w Markowe Kursy - zaczynamy od konkretów",
      preheader: "Dziękujemy za zapis. Oto co dla Ciebie przygotowaliśmy.",
      content: `Cześć,

dobrze Cię tu widzieć. Zapisałeś się, bo chcesz robić w izolacjach przemysłowych to, na czym naprawdę się zarabia - i trafiłeś we właściwe miejsce.

Markowe Kursy to akademia zbudowana przez praktyków: inspektorów FROSIO, obmiarowców i brygadzistów, którzy pracują na realnych projektach, m.in. w standardzie NORSOK.

## Na start konkret, który możesz wykorzystać od razu

Zanim zaczniesz cokolwiek izolować, sprawdź trzy rzeczy: klasę izolacji z dokumentacji, materiał przypisany do danej linii oraz wymaganą grubość. Ten prosty nawyk eliminuje większość poprawek, za które ekipa traci dniówki.

W kolejnych dniach pokażę Ci, jak z takich detali układa się cała ścieżka kariery - od pierwszego montażu po samodzielne obmiary.

Na razie zajrzyj do katalogu i zobacz, od czego możesz zacząć.`,
      ctaLabel: "Zobacz katalog kursów",
      ctaPath: "/courses",
    },
    {
      delayDays: 2,
      stage: "TOFU",
      subject: "Dlaczego NORSOK zmienia zasady gry (i Twoją stawkę)",
      preheader: "Standard, który oddziela ekipę od specjalisty.",
      content: `Na polskiej budowie "jakoś to będzie" czasem przechodzi. Na projekcie norweskim - nie.

NORSOK to zestaw norm, które precyzyjnie określają, jak ma wyglądać izolacja, płaszcz ochronny i dokumentacja. Brzmi jak biurokracja, ale to właśnie dzięki temu specjalista, który zna te wymagania, zarabia wielokrotnie więcej niż zwykły monter.

## Trzy rzeczy, które robią różnicę

- Czytanie dokumentacji technicznej (ISO, P&ID) bez zgadywania.
- Prawidłowe wykonanie płaszcza - tak, żeby przeszło odbiór za pierwszym razem.
- Rzetelny obmiar, na podstawie którego rozlicza się cały kontrakt.

Każdą z tych kompetencji da się opanować krok po kroku. Pokażę Ci jak - w następnych wiadomościach.`,
      ctaLabel: "Poznaj Akademię",
      ctaPath: "/o-nas",
    },
    // ---------- MOFU: rozważanie ----------
    {
      delayDays: 2,
      stage: "MOFU",
      subject: "Najczęstszy błąd początkujących izolerów",
      preheader: "Kosztuje czas, materiał i zaufanie brygadzisty.",
      content: `Większość ludzi wchodzi w izolacje przez przypadek - ktoś polecił, była wolna dniówka. I uczą się metodą prób i błędów, na własnej skórze.

Problem w tym, że błędy w tej branży są drogie: źle dobrany materiał, kolano wykonane "na oko", obmiar, który nie zgadza się z dokumentacją. Efekt? Poprawki, stracony czas i opinia "zielonego" na budowie.

## Da się inaczej

Kiedy rozumiesz zasady - dobór materiału, mechanikę przewodzenia ciepła, logikę rozwinięć blacharskich - przestajesz zgadywać. Robisz od razu dobrze i widać, że wiesz, co robisz.

Właśnie po to powstały nasze kursy: żebyś nie uczył się latami na błędach, tylko w kilka tygodni przeszedł drogę, którą praktycy przeszli przez całą karierę.`,
      ctaLabel: "Zobacz, od czego zacząć",
      ctaPath: "/courses",
    },
    {
      delayDays: 2,
      stage: "MOFU",
      subject: "Od montażu do obmiarowca - Twoja ścieżka",
      preheader: "Cztery role, jedna logiczna droga rozwoju.",
      content: `Nie musisz od razu celować w rolę Insulation Surveyora. Ale warto wiedzieć, dokąd zmierzasz.

## Ścieżki kariery w izolacjach

- Izoler - pewny start: podstawy, dobór materiału, poprawny montaż.
- Warsztatowiec - prefabrykacja i płaszcze ochronne, czytanie rysunków.
- Obmiarowiec - izometria, SketchUp i obmiar, czyli kompetencje, na których zarabia się najlepiej.
- Brygadzista - organizacja pracy i odpowiedzialność za ekipę.

Każda ścieżka to gotowy zestaw kursów w jednej, niższej cenie niż kupowanie ich osobno. Wybierasz stanowisko, do którego chcesz dojść - a my układamy Ci drogę.`,
      ctaLabel: "Wybierz swoją ścieżkę",
      ctaPath: "/sciezki/izoler",
    },
    {
      delayDays: 2,
      stage: "MOFU",
      subject: "Nie mam czasu i doświadczenia - czy to dla mnie?",
      preheader: "Dwie najczęstsze obawy. Rozwiejmy je.",
      content: `Słyszymy to najczęściej: "nie mam czasu" i "nie mam doświadczenia". Po kolei.

## Czas

Kurs jest w 100% online. Uczysz się z telefonu, tabletu albo komputera, kiedy i gdzie chcesz - w delegacji, w podróży, w domu. Dostęp masz przez 12 miesięcy, bez sztywnych terminów i zjazdów. Jedna lekcja dziennie w zupełności wystarczy.

## Doświadczenie

Kursy podstawowe nie wymagają wcześniejszego przygotowania. Zaczynasz od zera i krok po kroku dochodzisz do konkretnych umiejętności. Materiały są oparte na realnych projektach, nie na teorii z podręcznika.

Innymi słowy: jeśli chcesz, to jest to dla Ciebie. Reszta to kwestia decyzji.`,
      ctaLabel: "Sprawdź kursy dla początkujących",
      ctaPath: "/courses",
    },
    // ---------- BOFU: decyzja ----------
    {
      delayDays: 2,
      stage: "BOFU",
      subject: "Certyfikat, który widać w CV",
      preheader: "Konkretny dowód kompetencji - i co Ci daje.",
      content: `Po ukończeniu kursu otrzymujesz certyfikat z numerem, który możesz zweryfikować online. To nie jest ozdoba - to konkretny argument w rozmowie o pracę i o stawkę.

## Co dostajesz w kursie

- Praktyczną wiedzę z realnych projektów przemysłowych.
- Interaktywne lekcje - m.in. animowaną tablicę kreślarską, na której widzisz każdy krok.
- 12 miesięcy dostępu i materiały zawsze pod ręką.
- Certyfikat ukończenia z weryfikacją.

To wszystko w cenie niższej niż jedna dniówka na budowie. A zwraca się przy pierwszym lepszym kontrakcie, na który wejdziesz jako specjalista, a nie "do pomocy".`,
      ctaLabel: "Wybieram kurs",
      ctaPath: "/courses",
    },
    {
      delayDays: 3,
      stage: "BOFU",
      subject: "Ostatnia wiadomość z tej serii",
      preheader: "Krótkie podsumowanie i jedna decyzja.",
      content: `To ostatnia wiadomość z serii powitalnej. Nie chcę Cię zasypywać - wolę, żebyś zapamiętał jedno.

Przez ostatnie dni pokazałem Ci, jak z podstaw izolacji układa się cała ścieżka kariery: od montażu, przez płaszcze i prefabrykację, po obmiary, na których zarabia się najlepiej.

Wiedza jest po Twojej stronie. Brakuje już tylko decyzji.

## Jeśli chcesz zacząć

Wejdź do katalogu, wybierz kurs albo całą ścieżkę i zrób pierwszą lekcję jeszcze dziś. Masz 12 miesięcy dostępu, więc niczym nie ryzykujesz - a za rok możesz być w zupełnie innym miejscu.

Trzymam kciuki i do zobaczenia w środku.`,
      ctaLabel: "Zaczynam teraz",
      ctaPath: "/courses",
    },
  ],
};
