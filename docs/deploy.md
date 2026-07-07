# Wdrożenie na Vercel — przewodnik

Stan: aplikacja gotowa do wdrożenia (build produkcyjny 39 tras, zero błędów).
Wszystko działa poza realnymi płatnościami (Stripe — Faza 4) i wysyłką
e-maili (Resend — do podłączenia). To wdrożenie „staging/produkcja bez
sprzedaży" — bezpieczne do testów na realnych urządzeniach i podpięcia domeny.

## 1. GitHub (repozytorium)
1. Utwórz **prywatne** repo na github.com (np. `markowe-kursy-platform`), puste.
2. Przekaż mi jego URL — wypchnę kod (lub zrób sam):
   ```
   git remote add origin https://github.com/<login>/markowe-kursy-platform.git
   git push -u origin main
   ```
   `.env.local` NIE trafi do repo (jest w .gitignore) — sekrety bezpieczne.

## 2. Vercel (import projektu)
1. vercel.com → Add New → Project → Import z GitHuba (repo z pkt 1).
2. Framework: Next.js (wykryje automatycznie). Nie zmieniaj build command.
3. Przed pierwszym deployem ustaw **Environment Variables** (pkt 3).
4. Deploy. Dostaniesz URL `https://<projekt>.vercel.app`.

## 3. Zmienne środowiskowe w Vercel (Settings → Environment Variables)
Ustaw dla środowiska **Production** (i Preview):

| Zmienna | Wartość |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | adres produkcyjny, np. `https://markowekursy.pl` (na start URL vercel.app) |
| `NEXT_PUBLIC_SUPABASE_URL` | z Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | secret key (tylko serwer) |
| `CRON_SECRET` | losowy ciąg (Vercel sam doda go do nagłówka crona) |
| `RESEND_API_KEY` | po podłączeniu Resend (inaczej maile czekają w outbox) |
| `EMAIL_FROM` | np. `MARKOWE KURSY <kontakt@markowekursy.pl>` |
| `CERTIFICATE_STORAGE_BUCKET` | `certificates` |
| `STRIPE_*` | dopiero w Fazie 4 |

> `NEXT_PUBLIC_SITE_URL` musi być prawdziwym adresem produkcyjnym — od niego
> zależą linki w e-mailach, logo w mailu, adres w QR certyfikatu i URL-e
> powrotu z płatności.

## 4. Supabase — dopuszczenie adresu produkcyjnego
- Supabase → Authentication → URL Configuration:
  - **Site URL**: adres produkcyjny.
  - **Redirect URLs**: dodaj `https://<domena>/auth/callback`.
- (Migracje/seed są już wgrane — ta sama baza obsłuży produkcję.)

## 5. Cron (Vercel)
`vercel.json` definiuje dwa zadania, oba raz dziennie — plan Hobby
pozwala na cron maksymalnie raz na dobę (częstsze, np. co 15 minut,
odrzuca deploy): lifecycle o 6:00, process-outbox o 6:30. Vercel wykryje
je automatycznie i zabezpieczy `CRON_SECRET`. Przy przejściu na plan Pro
można process-outbox przywrócić do częstszego interwału (np. co 15 min).

## 6. Domena markowekursy.pl (Kru.pl)
1. Vercel → Settings → Domains → dodaj `markowekursy.pl` i `www`.
2. Vercel poda **rekordy DNS** (A / CNAME). Wpisz je w panelu Kru.pl
   (Domeny → DNS). NIE kupuj hostingu — domena wskaże na Vercel.
3. Po propagacji (do kilku godzin) HTTPS włączy się automatycznie.
4. Zmień `NEXT_PUBLIC_SITE_URL` na `https://markowekursy.pl` i zrób redeploy.

## 7. Po wdrożeniu — checklist szybkiego testu
- [ ] Strona główna, katalog, strony kursów, ścieżki — ładują się.
- [ ] Rejestracja → e-mail potwierdzający (Supabase) → logowanie.
- [ ] Panel kursanta, panel admina (po `npm run make-admin`).
- [ ] Chroniona lekcja tylko dla zalogowanego z dostępem.
- [ ] Dokumenty prawne i stopka dostępne.
- [ ] (Po Resend) test e-maila; (po Stripe) test zakupu.

## Uwaga: kolejność „go-live sprzedaży"
Publiczną sprzedaż włączamy dopiero, gdy: Stripe działa (Faza 4),
Resend wysyła maile, dane firmy w dokumentach prawnych uzupełnione,
konto testowe usunięte. Do tego czasu kursy mogą zostać `coming_soon`
(panel admina → Kursy), a jedyny kupowalny kurs pokazuje komunikat
„sklep wkrótce".
