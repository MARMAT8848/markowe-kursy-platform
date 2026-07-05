import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PanelHeader from "@/components/dashboard/PanelHeader";
import SiteFooter from "@/components/SiteFooter";
import ProfileSettings from "@/components/dashboard/ProfileSettings";
import { createSupabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Ustawienia konta — MARKOWE KURSY",
};

export default async function SettingsPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/settings");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <>
      <PanelHeader
        fullName={profile?.full_name ?? ""}
        leaveHref="/dashboard"
        leaveLabel="Wróć do panelu"
      />
      <section style={{ padding: "34px 0 44px", minHeight: "55vh" }}>
        <div className="wrap">
          <div className="kicker-row">
            <span className="kicker-line"></span>
            <span className="kicker">USTAWIENIA KONTA</span>
          </div>
          <h1
            style={{
              margin: "0 0 22px",
              font: "600 26px/1.15 var(--sans)",
              letterSpacing: "-.025em",
              color: "var(--ink)",
            }}
          >
            Twoje dane
          </h1>
          <ProfileSettings
            initialFullName={profile?.full_name ?? ""}
            email={user.email ?? ""}
          />
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
