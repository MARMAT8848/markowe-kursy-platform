import type { Metadata } from "next";
import LegalDoc from "@/components/LegalDoc";
import { REGULAMIN } from "@/lib/legal/regulamin";

export const metadata: Metadata = {
  title: "Regulamin - MARKOWE KURSY",
  description: "Regulamin platformy Markowe Kursy (markowekursy.pl).",
};

export default function RegulaminPage() {
  return <LegalDoc doc={REGULAMIN} />;
}
