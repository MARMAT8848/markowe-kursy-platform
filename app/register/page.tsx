import type { Metadata } from "next";
import AuthPage from "@/components/auth/AuthPage";

export const metadata: Metadata = {
  title: "Załóż konto - MARKOWE KURSY",
  description: "Załóż konto w akademii technicznej MARKOWE KURSY.",
};

export default function RegisterPage() {
  return <AuthPage mode="register" />;
}
