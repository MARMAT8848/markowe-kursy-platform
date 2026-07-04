"use client";

import { useState } from "react";
import type { CourseModuleDef } from "@/lib/courses";

export default function ModulesAccordion({
  modules,
}: {
  modules: CourseModuleDef[];
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
              <span className="acc-q">{m.title}</span>
              <span className="acc-sign">{isOpen ? "–" : "+"}</span>
            </button>
            <div className="acc-body">
              <p>{m.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
