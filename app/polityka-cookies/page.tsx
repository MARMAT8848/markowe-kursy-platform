import type { Metadata } from "next";
import LegalDoc from "@/components/LegalDoc";
import { POLITYKA_COOKIES } from "@/lib/legal/polityka-cookies";

export const metadata: Metadata = {
  title: "Polityka cookies — MARKOWE KURSY",
  description:
    "Polityka plików cookies platformy Markowe Kursy (markowekursy.pl).",
};

export default function PolitykaCookiesPage() {
  return <LegalDoc doc={POLITYKA_COOKIES} />;
}
