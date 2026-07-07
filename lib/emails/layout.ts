/**
 * Wspólny layout e-maili transakcyjnych (proste, inline'owane style —
 * kompatybilne z klientami pocztowymi). Marka: czerwień + czysta
 * typografia systemowa (fonty webowe nie są pewne w e-mailu).
 */
// Odrzucamy localhost, gdyby zmienna była błędnie ustawiona — e-mail
// wysyłany do klienta nigdy nie może zawierać lokalnego adresu.
const envSite = process.env.NEXT_PUBLIC_SITE_URL;
const SITE =
  envSite && !envSite.includes("localhost") ? envSite : "https://markowekursy.pl";
const ACCENT = "#E1121A";
const INK = "#161616";

export function emailLayout(opts: {
  heading: string;
  bodyHtml: string;
  preheader?: string;
}): string {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#ECEAE6;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${INK}">
${opts.preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0">${opts.preheader}</div>` : ""}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ECEAE6;padding:24px 0">
<tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:560px;max-width:92%;background:#fff;border:1px solid #E7E6E4;border-radius:14px;overflow:hidden">
  <tr><td style="height:6px;background:${ACCENT}"></td></tr>
  <tr><td style="padding:24px 32px 8px">
    <table role="presentation" cellpadding="0" cellspacing="0"><tr>
      <td style="vertical-align:middle;padding-right:12px">
        <img src="${SITE}/assets/logo.png" width="46" height="46" alt="MARKOWE KURSY" style="display:block;width:46px;height:46px">
      </td>
      <td style="vertical-align:middle">
        <div style="font-weight:700;font-size:17px;letter-spacing:-.02em">MARKOWE <span style="color:${ACCENT}">KURSY</span></div>
        <div style="font-size:11px;letter-spacing:.14em;color:#9C9B98;margin-top:2px">AKADEMIA TECHNICZNA</div>
      </td>
    </tr></table>
  </td></tr>
  <tr><td style="padding:12px 32px 4px">
    <h1 style="margin:0 0 12px;font-size:20px;line-height:1.25;letter-spacing:-.02em;color:${INK}">${opts.heading}</h1>
  </td></tr>
  <tr><td style="padding:0 32px 26px;font-size:14px;line-height:1.65;color:#3A3A3A">
    ${opts.bodyHtml}
  </td></tr>
  <tr><td style="padding:18px 32px;background:#FBFBFA;border-top:1px solid #EFEEEB;font-size:11.5px;line-height:1.7;color:#9C9B98">
    Markowe Kursy · <a href="${SITE}" style="color:#6F6F6F">markowekursy.pl</a><br>
    <a href="${SITE}/regulamin" style="color:#6F6F6F">Regulamin</a> ·
    <a href="${SITE}/polityka-prywatnosci" style="color:#6F6F6F">Polityka prywatności</a> ·
    <a href="${SITE}/zwroty-i-reklamacje" style="color:#6F6F6F">Zwroty i reklamacje</a><br>
    © ${year} Markowe Kursy
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

export function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:${ACCENT};color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 22px;border-radius:9px">${label}</a>`;
}

export function infoRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:6px 0;font-size:12.5px;color:#9C9B98;width:150px;vertical-align:top">${label}</td>
    <td style="padding:6px 0;font-size:13.5px;color:${INK};font-weight:600">${value}</td>
  </tr>`;
}
