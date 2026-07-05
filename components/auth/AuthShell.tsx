import SiteHeader from "@/components/SiteHeader";

/* eslint-disable @next/next/no-img-element */

/** Wyśrodkowany layout stron auth (logo + karta) — wspólny dla
 *  logowania, rejestracji, resetu hasła. */
export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "var(--bg-off)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <SiteHeader showLogin={false} />
      <div className="login-logo-block">
        <img src="/assets/logo.png" alt="MARKOWE KURSY" />
      </div>
      <div className="login-card-wrap">{children}</div>
    </div>
  );
}
