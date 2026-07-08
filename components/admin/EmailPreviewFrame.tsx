"use client";

/** Podgląd wiadomości w izolowanej ramce (pełny HTML e-maila). */
export default function EmailPreviewFrame({ html }: { html: string }) {
  return (
    <iframe
      srcDoc={html}
      title="Podgląd wiadomości"
      sandbox=""
      style={{
        width: "100%",
        height: 640,
        border: "1px solid var(--border)",
        borderRadius: 12,
        background: "#ECEAE6",
      }}
    />
  );
}
