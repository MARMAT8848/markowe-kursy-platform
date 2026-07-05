"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";

/** Edycja danych profilu. full_name jest używane na certyfikacie —
 *  dlatego wyraźnie o tym informujemy. */
export default function ProfileSettings({
  initialFullName,
  email,
}: {
  initialFullName: string;
  email: string;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialFullName);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const trimmed = fullName.trim();
    if (trimmed.length < 3) {
      setNotice("Podaj imię i nazwisko (min. 3 znaki).");
      return;
    }
    setBusy(true);
    setNotice(null);
    const supabase = createSupabaseBrowser();
    const { data: userRes } = await supabase.auth.getUser();
    const uid = userRes.user?.id;
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: trimmed })
      .eq("id", uid!);
    setBusy(false);
    if (error) {
      setNotice("Nie udało się zapisać zmian. Spróbuj ponownie.");
      return;
    }
    setNotice("Zapisano zmiany.");
    router.refresh();
  }

  return (
    <form className="kontakt-form" onSubmit={onSubmit} style={{ maxWidth: 520 }}>
      <label className="field-label">
        Imię i nazwisko
        <input
          className="field"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          placeholder="Jan Kowalski"
        />
      </label>
      <p
        style={{
          margin: "-6px 0 0",
          fontSize: 12,
          lineHeight: 1.5,
          color: "var(--muted)",
        }}
      >
        Ta nazwa pojawi się na certyfikacie ukończenia kursu. Certyfikaty już
        wydane zachowują nazwę z chwili wystawienia.
      </p>
      <label className="field-label">
        E-mail
        <input
          className="field"
          type="email"
          value={email}
          disabled
          style={{ background: "var(--bg-off)", color: "var(--muted)" }}
        />
      </label>
      {notice && <div className="form-confirm">{notice}</div>}
      <div>
        <button className="form-submit" type="submit" disabled={busy}>
          {busy ? "Zapisywanie…" : "Zapisz zmiany"}
        </button>
      </div>
    </form>
  );
}
