import "server-only";

/**
 * Weryfikacja żądań cron. Vercel Cron wysyła nagłówek
 * `Authorization: Bearer <CRON_SECRET>`. Endpointy cron odrzucają
 * żądania bez poprawnego sekretu (403), by nie dało się ich wywołać
 * z zewnątrz.
 */
export function verifyCron(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}
