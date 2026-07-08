import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// Samohostowane fonty (next/font) — brak zewnętrznego żądania i przesunięć
// layoutu. latin-ext obejmuje polskie znaki diakrytyczne.
const plexSans = IBM_Plex_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-sans",
  display: "swap",
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MARKOWE KURSY - Akademia techniczna izolacji przemysłowych",
  description:
    "Ścieżki kariery dla specjalistów izolacji przemysłowych — szkolenia oparte na realnych projektach i wymaganiach standardu NORSOK. Obmiarowanie, prefabrykacja, dokumentacja ISO/P&ID.",
  icons: { icon: "/assets/logo.png" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl" className={`${plexSans.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
