import SiteFooter from "@/components/SiteFooter";

/**
 * Layout stron panelu: nagłówek + treść na górze, stopka ZAWSZE
 * przyklejona do dołu okna (nawet przy krótkiej treści). Rozwiązuje
 * problem stopki „wiszącej w połowie strony".
 */
export default function PanelShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}
    >
      {children}
      <div style={{ flex: 1 }} />
      <SiteFooter />
    </div>
  );
}
