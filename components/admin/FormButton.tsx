"use client";

/**
 * Przycisk oparty na PRAWDZIWYM formularzu (POST akcji serwerowej), więc
 * redirect() po stronie serwera realnie nawiguje przeglądarkę. Dla akcji,
 * które return-ują wynik bez nawigacji, używaj ActionButton.
 */
export default function FormButton({
  action,
  fields = {},
  label,
  confirmMsg,
  variant = "primary",
}: {
  action: (formData: FormData) => void | Promise<void>;
  fields?: Record<string, string>;
  label: string;
  confirmMsg?: string;
  variant?: "primary" | "ink" | "subtle" | "danger";
}) {
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: "var(--accent)", color: "#fff", border: "none" },
    ink: { background: "var(--ink)", color: "#fff", border: "none" },
    subtle: { background: "#fff", color: "var(--ink)", border: "1px solid var(--border)" },
    danger: { background: "var(--accent)", color: "#fff", border: "none" },
  };
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (confirmMsg && !window.confirm(confirmMsg)) e.preventDefault();
      }}
      style={{ display: "inline" }}
    >
      {Object.entries(fields).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <button
        type="submit"
        style={{
          padding: "9px 16px",
          borderRadius: 9,
          font: "600 13px var(--sans)",
          cursor: "pointer",
          ...styles[variant],
        }}
      >
        {label}
      </button>
    </form>
  );
}
