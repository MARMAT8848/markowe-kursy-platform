/**
 * Publiczny adres serwisu — używany wszędzie tam, gdzie link lub obrazek
 * trafia POZA przeglądarkę użytkownika (e-maile, kody QR na certyfikatach).
 *
 * Localhost jest odrzucany: e-mail wysłany do klienta nigdy nie może
 * zawierać adresu lokalnego.
 *
 * UWAGA: gdy domena markowekursy.pl zostanie podpięta w Vercel, zmień
 * PROD_FALLBACK na "https://markowekursy.pl" (to jedyne miejsce).
 */
const PROD_FALLBACK = "https://markowe-kursy-platform.vercel.app";

export function publicSiteUrl(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env && !env.includes("localhost")) return env.replace(/\/+$/, "");
  return PROD_FALLBACK;
}

export const PUBLIC_SITE = publicSiteUrl();
