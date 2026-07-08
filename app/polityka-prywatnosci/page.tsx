import type { Metadata } from "next";
import LegalDoc from "@/components/LegalDoc";
import { POLITYKA_PRYWATNOSCI } from "@/lib/legal/polityka-prywatnosci";

export const metadata: Metadata = {
  title: "Polityka prywatności - MARKOWE KURSY",
  description:
    "Polityka prywatności platformy Markowe Kursy (markowekursy.pl).",
};

export default function PolitykaPrywatnosciPage() {
  return <LegalDoc doc={POLITYKA_PRYWATNOSCI} />;
}
