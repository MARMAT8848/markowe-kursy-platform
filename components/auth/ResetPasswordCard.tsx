"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";

/** Ustawienie nowego hasła po kliknięciu linku z e-maila. Wymaga
 *  sesji recovery (ustawianej przez /auth/callback). */
export default function ResetPasswordCard() {
  const router = useRouter();
  const [ready, setReady] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowser();
    supabase.auth.getUser().then(({ data }) => setReady(!!data.user));
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const form = new FormData(e.currentTarget);
    const pass = String(form.get("password"));
    const confirm = String(form.get("confirm"));
    if (pass !== confirm) {
      setNotice("Hasła nie są takie same.");
      return;
    }
    setBusy(true);
    setNotice(null);
    const supabase = createSupabaseBrowser();
    const { error } = await supabase.auth.updateUser({ password: pass });
    setBusy(false);
    if (error) {
      setNotice(
        error.message.toLowerCase().includes("should be at least")
          ? "Hasło musi mieć co najmniej 8 znaków."
          : "Nie udało się zmienić hasła. Link mógł wygasnąć - poproś o nowy."
      );
      return;
    }
    setDone(true);
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 1500);
  }

  return (
    <div className="login-card">
      <div className="login-card-body">
        <h1
          style={{
            margin: "0 0 14px",
            font: "600 20px var(--sans)",
            letterSpacing: "-.02em",
            color: "var(--ink)",
          }}
        >
          Ustaw nowe hasło
        </h1>
        {ready === false ? (
          <div className="form-confirm">
            Link do zmiany hasła jest nieprawidłowy lub wygasł. Wróć do{" "}
            <a href="/forgot-password" style={{ color: "var(--accent)", fontWeight: 600 }}>
              resetu hasła
            </a>{" "}
            i poproś o nowy.
          </div>
        ) : done ? (
          <div className="form-confirm">
            Hasło zostało zmienione. Przekierowujemy do panelu…
          </div>
        ) : (
          <form className="login-form" onSubmit={onSubmit}>
            <label className="field-label">
              Nowe hasło
              <input
                className="field"
                type="password"
                name="password"
                required
                minLength={8}
                placeholder="min. 8 znaków"
              />
            </label>
            <label className="field-label">
              Powtórz hasło
              <input
                className="field"
                type="password"
                name="confirm"
                required
                minLength={8}
                placeholder="min. 8 znaków"
              />
            </label>
            {notice && <div className="form-confirm">{notice}</div>}
            <button
              className="login-submit"
              type="submit"
              disabled={busy || ready === null}
            >
              {busy ? "Zapisywanie…" : "Zapisz nowe hasło"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
