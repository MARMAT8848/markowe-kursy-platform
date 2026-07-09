import Link from "next/link";

/* eslint-disable @next/next/no-img-element */

/**
 * Nagłówek panelu kursanta (port 1:1 z panel-kursu.html):
 * logo + wordmark, awatar z inicjałami, przycisk wyjścia.
 */
export default function PanelHeader({
  fullName,
  leaveHref = "/",
  leaveLabel = "Opuść kurs",
  showSignOut = false,
  isAdmin = false,
}: {
  fullName: string;
  leaveHref?: string;
  leaveLabel?: string;
  showSignOut?: boolean;
  isAdmin?: boolean;
}) {
  const initials =
    fullName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "MK";

  return (
    <header className="site-header panel-header">
      <div className="header-inner">
        <Link className="logo-link" href="/">
          <img
            className="logo-img"
            src="/assets/logo.png"
            alt="MARKOWE KURSY"
          />
        </Link>
        <Link className="wordmark" href="/">
          MARKOWE <span>KURSY</span>
        </Link>
        <div className="header-spacer"></div>
        {isAdmin && (
          <Link
            href="/admin"
            className="leave-course admin-quicklink"
            style={{ borderColor: "var(--ink)" }}
          >
            Panel admina
          </Link>
        )}
        <span className="account-chip">
          <span className="account-avatar">{initials}</span>
          <span className="account-name">{fullName || "Moje konto"}</span>
        </span>
        {showSignOut ? (
          <form action="/auth/signout" method="post">
            <button
              className="leave-course"
              type="submit"
              style={{ cursor: "pointer", font: "600 13px var(--sans)" }}
            >
              <svg
                viewBox="0 0 24 24"
                width="13"
                height="13"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.6"
              >
                <path d="M18 6L6 18M6 6l12 12"></path>
              </svg>
              Wyloguj
            </button>
          </form>
        ) : (
          <Link className="leave-course" href={leaveHref}>
            <svg
              viewBox="0 0 24 24"
              width="13"
              height="13"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.6"
            >
              <path d="M18 6L6 18M6 6l12 12"></path>
            </svg>
            {leaveLabel}
          </Link>
        )}
      </div>
    </header>
  );
}
