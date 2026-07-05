import type { Metadata } from "next";
import AuthShell from "@/components/auth/AuthShell";
import ResetPasswordCard from "@/components/auth/ResetPasswordCard";

export const metadata: Metadata = {
  title: "Ustaw nowe hasło — MARKOWE KURSY",
  robots: { index: false },
};

export default function ResetPasswordPage() {
  return (
    <AuthShell>
      <ResetPasswordCard />
    </AuthShell>
  );
}
