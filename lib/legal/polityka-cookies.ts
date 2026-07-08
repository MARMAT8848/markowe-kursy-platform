import {
  LEGAL_EFFECTIVE_DATE,
  LEGAL_VERSIONS,
  type LegalDocument,
} from "./consents";

export const POLITYKA_COOKIES: LegalDocument = {
  slug: "polityka-cookies",
  title: "Polityka plików cookies platformy Markowe Kursy",
  version: LEGAL_VERSIONS.cookies,
  effectiveDate: LEGAL_EFFECTIVE_DATE,
  body: `
## 1. Informacje ogólne

Niniejsza Polityka cookies opisuje zasady wykorzystywania plików cookies i podobnych technologii na platformie Markowe Kursy dostępnej pod adresem markowekursy.pl.

Właścicielem platformy jest:

[PEŁNA NAZWA FIRMY / IMIĘ I NAZWISKO PRZEDSIĘBIORCY]
[ADRES SIEDZIBY / ADRES DZIAŁALNOŚCI]
NIP: [NIP]
E-mail: [ADRES E-MAIL]

## 2. Czym są pliki cookies

Pliki cookies to niewielkie pliki tekstowe zapisywane na urządzeniu użytkownika podczas korzystania ze strony internetowej. Cookies mogą być wykorzystywane do zapewnienia działania strony, utrzymania sesji, zapamiętywania ustawień, prowadzenia statystyk lub działań marketingowych.

## 3. Rodzaje cookies wykorzystywanych na platformie

Platforma może wykorzystywać następujące rodzaje cookies:

### 3.1. Cookies niezbędne

Są konieczne do prawidłowego działania platformy. Umożliwiają między innymi:

a. logowanie do konta,
b. utrzymanie sesji użytkownika,
c. obsługę koszyka lub procesu zakupu,
d. zapewnienie bezpieczeństwa,
e. zapamiętanie wymaganych zgód.

Cookies niezbędne mogą być stosowane bez dodatkowej zgody użytkownika, ponieważ są konieczne do świadczenia usługi.

### 3.2. Cookies analityczne

Pomagają zrozumieć, w jaki sposób użytkownicy korzystają ze strony, które treści są najczęściej odwiedzane oraz jak można poprawić działanie platformy.

Cookies analityczne powinny być stosowane po uzyskaniu zgody użytkownika, jeżeli wymagają tego przepisy prawa lub konfiguracja narzędzia.

### 3.3. Cookies marketingowe

Mogą być wykorzystywane do prowadzenia działań reklamowych, mierzenia skuteczności kampanii oraz dopasowywania komunikatów marketingowych.

Cookies marketingowe są stosowane wyłącznie po uzyskaniu zgody użytkownika, jeżeli zostaną wdrożone na platformie.

### 3.4. Cookies funkcjonalne

Pozwalają zapamiętać ustawienia użytkownika, takie jak preferowany język lub inne ustawienia interfejsu.

## 4. Zgoda na cookies

1. Przy pierwszej wizycie na stronie użytkownik może zobaczyć baner lub panel zarządzania zgodami cookies.

2. Użytkownik powinien mieć możliwość zaakceptowania, odrzucenia lub dostosowania zgód na cookies inne niż niezbędne.

3. Zgoda na cookies analityczne i marketingowe nie może być wymuszana, jeżeli nie jest konieczna do działania platformy.

4. Użytkownik powinien mieć możliwość zmiany zgód w dowolnym momencie.

## 5. Zarządzanie cookies w przeglądarce

Użytkownik może zarządzać plikami cookies także z poziomu ustawień swojej przeglądarki internetowej. Ograniczenie lub wyłączenie cookies niezbędnych może jednak spowodować, że niektóre funkcje platformy, w tym logowanie, zakup kursu lub dostęp do panelu kursanta, nie będą działały prawidłowo.

## 6. Narzędzia zewnętrzne

Platforma może korzystać z narzędzi dostawców zewnętrznych, takich jak:

a. Supabase - autoryzacja i działanie konta,
b. Stripe - obsługa płatności,
c. Vercel - hosting,
d. Resend lub podobny dostawca - e-maile transakcyjne,
e. Google Analytics lub inne narzędzie analityczne - jeżeli zostanie wdrożone.

Aktualna lista narzędzi powinna odpowiadać faktycznej konfiguracji platformy.

## 7. Zmiany Polityki cookies

Administrator może aktualizować niniejszą Politykę cookies, w szczególności w przypadku zmiany narzędzi wykorzystywanych na platformie lub zmiany przepisów prawa.

Aktualna wersja Polityki cookies będzie dostępna na stronie markowekursy.pl.
`,
};
