import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MARKOWE KURSY — Akademia techniczna izolacji przemysłowych",
  description:
    "Szkolenia online dla specjalistów izolacji przemysłowych — kursy oparte na realnych projektach przemysłowych. Obmiarowanie, prefabrykacja, dokumentacja techniczna.",
  icons: { icon: "/assets/logo.png" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
