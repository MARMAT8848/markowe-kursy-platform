import type { Metadata } from "next";
import AuthPage from "@/components/auth/AuthPage";

export const metadata: Metadata = {
  title: "Logowanie — MARKOWE KURSY",
  description: "Zaloguj się do akademii technicznej MARKOWE KURSY.",
};

export default function LoginPage() {
  return <AuthPage mode="login" />;
}
