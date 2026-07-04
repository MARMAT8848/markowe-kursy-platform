import SiteHeader from "@/components/SiteHeader";
import AuthCard from "@/components/auth/AuthCard";

/* eslint-disable @next/next/no-img-element */

export default function AuthPage({ mode }: { mode: "login" | "register" }) {
  return (
    <div
      style={{
        background: "var(--bg-off)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <SiteHeader showLogin={false} />
      <div className="login-logo-block">
        <img src="/assets/logo.png" alt="MARKOWE KURSY" />
      </div>
      <div className="login-card-wrap">
        <AuthCard mode={mode} />
      </div>
    </div>
  );
}
