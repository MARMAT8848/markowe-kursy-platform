import { Suspense } from "react";
import AuthShell from "@/components/auth/AuthShell";
import AuthCard from "@/components/auth/AuthCard";

export default function AuthPage({ mode }: { mode: "login" | "register" }) {
  return (
    <AuthShell>
      <Suspense>
        <AuthCard mode={mode} />
      </Suspense>
    </AuthShell>
  );
}
