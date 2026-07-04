"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type NavKey = "kursy" | "dla-firm" | "o-nas" | "kontakt";

const NAV_ITEMS: { key: NavKey; label: string; href: string }[] = [
  { key: "kursy", label: "Kursy", href: "/courses" },
  { key: "dla-firm", label: "Dla firm", href: "/dla-firm" },
  { key: "o-nas", label: "O nas", href: "/o-nas" },
  { key: "kontakt", label: "Kontakt", href: "/kontakt" },
];

export default function SiteHeader({ active }: { active?: NavKey }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`site-header${scrolled ? " scrolled" : ""}`}>
      <div className="header-inner">
        <Link className="logo-link" href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="logo-img" src="/assets/logo.png" alt="MARKOWE KURSY" />
        </Link>
        <Link className="wordmark" href="/">
          MARKOWE <span>KURSY</span>
        </Link>
        <nav className="main-nav">
          {NAV_ITEMS.map((item) => (
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
        <Link className="login-link" href="/login">
          Zaloguj
        </Link>
        <Link className="btn btn-primary" href="/courses">
          Zobacz kursy
        </Link>
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
        {NAV_ITEMS.map((item) => (
          <Link key={item.key} href={item.href}>
            {item.label}
          </Link>
        ))}
        <Link className="mnav-login" href="/login">
          Zaloguj
        </Link>
      </nav>
    </header>
  );
}
