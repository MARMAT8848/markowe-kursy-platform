"use client";

import { useState } from "react";
import type { ProgramModule } from "@/lib/course-program";

/**
 * Akordeon programu kursu oparty na rzeczywistej strukturze z bazy:
 * moduł → lista lekcji (z czasem). Pierwszy moduł otwarty.
 * Lekcje bez gotowej treści oznaczone jako „wkrótce".
 */
export default function ProgramAccordion({
  modules,
}: {
  modules: ProgramModule[];
}) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="accordion accordion-modules kurs-modules">
      {modules.map((m, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className={`acc-item${isOpen ? " open" : ""}`}>
            <button
              className="acc-head"
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
            >
              <span className="acc-q">
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 11,
                    color: "var(--accent)",
                    marginRight: 8,
                  }}
                >
                  MODUŁ {i + 1}
                </span>
                {m.title}
              </span>
              <span className="acc-sign">{isOpen ? "–" : "+"}</span>
            </button>
            <div className="acc-body">
              <ul
                style={{
                  margin: 0,
                  padding: "0 18px 16px",
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {m.lessons.map((l, li) => (
                  <li
                    key={li}
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 10,
                      fontSize: 13,
                      color: "var(--sub)",
                    }}
                  >
                    <span
                      style={{
                        flex: "none",
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "var(--accent)",
                        transform: "translateY(-1px)",
                      }}
                    ></span>
                    <span style={{ flex: 1, color: "var(--ink)" }}>
                      {l.title}
                      {!l.available && (
                        <span
                          style={{
                            fontFamily: "var(--mono)",
                            fontSize: 9.5,
                            letterSpacing: ".06em",
                            color: "#B0AFAB",
                            marginLeft: 8,
                          }}
                        >
                          WKRÓTCE
                        </span>
                      )}
                    </span>
                    {l.minutes ? (
                      <span
                        style={{
                          flex: "none",
                          fontFamily: "var(--mono)",
                          fontSize: 10.5,
                          color: "var(--muted)",
                        }}
                      >
                        {l.minutes} min
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      })}
    </div>
  );
}
