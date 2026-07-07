/**
 * Sekcja „Ucz się, gdziekolwiek jesteś" — zbija najczęstszą obiekcję
 * targetu (praca rotacyjna, delegacje, brak czasu na stacjonarne kursy).
 * To samo hasło co w ramce na stronach kursów, tu wyeksponowane jako
 * pełnoprawna sekcja strony głównej (widoczna dla każdego odwiedzającego,
 * nie tylko tych, którzy trafią na konkretny kurs).
 */
export default function LearnAnywhere() {
  return (
    <section
      style={{
        padding: "56px 0",
        background: "var(--bg-off)",
        borderBottom: "1px solid var(--border-soft)",
      }}
    >
      <div className="wrap">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 22,
            maxWidth: 780,
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span
              style={{ width: 22, height: 2, background: "var(--accent)" }}
            ></span>
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: 12,
                letterSpacing: ".14em",
                color: "var(--accent)",
                fontWeight: 600,
              }}
            >
              UCZ SIĘ, GDZIEKOLWIEK JESTEŚ
            </span>
            <span
              style={{ width: 22, height: 2, background: "var(--accent)" }}
            ></span>
          </div>

          <h2
            style={{
              margin: 0,
              font: "600 30px/1.2 var(--sans)",
              letterSpacing: "-.02em",
              color: "var(--ink)",
            }}
          >
            Rotacja, delegacja czy dom — Ty decydujesz, kiedy i skąd się
            uczysz
          </h2>

          <p
            style={{
              margin: "0 auto",
              maxWidth: 620,
              fontSize: 15.5,
              lineHeight: 1.65,
              color: "var(--sub)",
            }}
          >
            Kurs jest w 100% online, więc uczysz się z dowolnego miejsca — na
            kwaterze podczas rotacji, w delegacji czy w domu. Wystarczy
            telefon, tablet lub komputer z internetem. Masz dostęp przez 12
            miesięcy i realizujesz materiał we własnym tempie, bez sztywnych
            terminów i zjazdów.
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "10px 28px",
              marginTop: 8,
            }}
          >
            {[
              "Dowolne urządzenie — telefon, tablet, komputer",
              "12 miesięcy dostępu, zero sztywnych terminów",
              "Materiały zostają z Tobą między wyjazdami",
            ].map((t) => (
              <span
                key={t}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13.5,
                  color: "var(--ink)",
                  fontWeight: 500,
                }}
              >
                <b style={{ color: "var(--accent)" }}>✓</b>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
