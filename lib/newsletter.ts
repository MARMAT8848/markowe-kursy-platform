import "server-only";
import { button } from "@/lib/emails/layout";

/**
 * Newsletter — logika wspólna.
 *
 * Format treści kampanii (kompozytor w panelu admina):
 * - pusta linia rozdziela akapity,
 * - linia zaczynająca się od "## " to śródtytuł,
 * - opcjonalny przycisk CTA (etykieta + adres) doklejany na końcu.
 * Treść jest ZAWSZE escapowana (żadnego surowego HTML od użytkownika),
 * a wygląd pochodzi z markowego szablonu e-maili — spójność gwarantowana.
 */

export function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function renderCampaignContent(
  content: string,
  ctaLabel?: string | null,
  ctaUrl?: string | null
): string {
  const blocks = content
    .replaceAll("\r\n", "\n")
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean)
    .map((block) => {
      if (block.startsWith("## ")) {
        return `<h2 style="margin:22px 0 10px;font-size:16px;line-height:1.3;letter-spacing:-.01em;color:#161616">${escapeHtml(block.slice(3))}</h2>`;
      }
      // pojedyncze łamania wewnątrz akapitu -> <br>
      return `<p style="margin:0 0 14px">${escapeHtml(block).replaceAll("\n", "<br>")}</p>`;
    });

  let html = blocks.join("\n");
  if (ctaLabel && ctaUrl && /^https?:\/\//.test(ctaUrl)) {
    html += `\n<p style="margin:22px 0 8px">${button(ctaUrl, escapeHtml(ctaLabel))}</p>`;
  }
  return html;
}

/** Token akcji bez logowania (potwierdzenie / wypis). */
export function newsletterToken(): string {
  return crypto.randomUUID().replaceAll("-", "");
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email) && email.length <= 254;
}
