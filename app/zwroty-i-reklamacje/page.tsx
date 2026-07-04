import type { Metadata } from "next";
import LegalDoc from "@/components/LegalDoc";
import { ZWROTY_I_REKLAMACJE } from "@/lib/legal/zwroty-i-reklamacje";

export const metadata: Metadata = {
  title: "Zwroty i reklamacje — MARKOWE KURSY",
  description:
    "Polityka zwrotów, odstąpienia od umowy i reklamacji platformy Markowe Kursy.",
};

export default function ZwrotyIReklamacjePage() {
  return <LegalDoc doc={ZWROTY_I_REKLAMACJE} />;
}
