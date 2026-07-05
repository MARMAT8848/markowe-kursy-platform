"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/client";

type NavKey = "kursy" | "dla-firm" | "o-nas" | "kontakt";

export default function SiteHeader({
  active,
  variant = "default",
  showLogin = true,
}: {
  active?: NavKey;
  /** 'catalog' — wyższy nagłówek katalogu z lupką i CTA „Załóż konto". */
  variant?: "default" | "catalog";
  /** false — bez linku „Zaloguj" (strona logowania). */
  showLogin?: boolean;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const supabase = createSupabaseBrowser();
    supabase.auth.getUser().then(({ data }) => setAuthed(!!data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setAuthed(!!session?.user)
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  const isCatalog = variant === "catalog";
  const navItems: { key: NavKey; label: string; href: string }[] = [
    { key: "kursy", label: isCatalog ? "Katalog" : "Kursy", href: "/courses" },
    { key: "dla-firm", label: "Dla firm", href: "/dla-firm" },
    { key: "o-nas", label: "O nas", href: "/o-nas" },
    { key: "kontakt", label: "Kontakt", href: "/kontakt" },
  ];

  return (
    <header
      className={`site-header${isCatalog ? " header-catalog" : ""}${scrolled ? " scrolled" : ""}`}
    >
      <div className="header-inner">
        <Link className="logo-link" href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="logo-img" src="/assets/logo.png" alt="MARKOWE KURSY" />
        </Link>
        <Link className="wordmark" href="/">
          MARKOWE <span>KURSY</span>
        </Link>
        <nav className="main-nav">
          {navItems.map((item) => (
            <Link
              key={item.key}
              className={active === item.key ? "active" : undefined}
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="header-spacer"></div>
        {isCatalog && (
          <button className="search-btn" aria-label="Szukaj">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#E1121A"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7"></circle>
              <path d="m20 20-3.5-3.5"></path>
            </svg>
          </button>
        )}
        {authed ? (
          <>
            <Link className="login-link" href="/dashboard">
              Panel kursanta
            </Link>
            <Link className="btn btn-primary" href="/courses">
              Zobacz kursy
            </Link>
          </>
        ) : (
          <>
            {showLogin && (
              <Link className="login-link" href="/login">
                Zaloguj
              </Link>
            )}
            {isCatalog ? (
              <Link className="btn btn-primary" href="/register">
                Załóż konto
              </Link>
            ) : (
              <Link className="btn btn-primary" href="/courses">
                Zobacz kursy
              </Link>
            )}
          </>
        )}
        <button
          className="hamburger"
          aria-label="Menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>
      <nav className={`mobile-nav${menuOpen ? " open" : ""}`}>
        {navItems.map((item) => (
          <Link key={item.key} href={item.href}>
            {item.label}
          </Link>
        ))}
        {authed ? (
          <Link className="mnav-login" href="/dashboard">
            Panel kursanta
          </Link>
        ) : (
          showLogin && (
            <Link className="mnav-login" href="/login">
              Zaloguj
            </Link>
          )
        )}
      </nav>
    </header>
  );
}
