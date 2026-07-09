"use client";

import { useState, useTransition } from "react";

type ActionResult = { ok: boolean; error?: string };

/** Nadanie dostępu użytkownikowi: wybór kursu + akcja (12 miesięcy). */
export default function GrantAccess({
  action,
  userId,
  courses,
}: {
  action: (fd: FormData) => Promise<ActionResult>;
  userId: string;
  courses: { slug: string; id: string; title: string }[];
}) {
  const [courseId, setCourseId] = useState(courses[0]?.id ?? "");
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  function run() {
    if (!courseId) return;
    setMsg(null);
    const fd = new FormData();
    fd.append("userId", userId);
    fd.append("courseId", courseId);
    start(async () => {
      const res = await action(fd);
      setMsg(res.ok ? "Nadano ✓" : res.error || "Błąd");
    });
  }

  // Użytkownik ma już wszystkie kursy → nie ma czego nadawać.
  if (courses.length === 0) {
    return (
      <span style={{ fontSize: 12, color: "var(--muted)", fontStyle: "italic" }}>
        Ma dostęp do wszystkich kursów
      </span>
    );
  }

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <select
        value={courseId}
        onChange={(e) => setCourseId(e.target.value)}
        style={{
          padding: "6px 8px",
          border: "1px solid var(--border)",
          borderRadius: 8,
          font: "13px var(--sans)",
          background: "#fff",
          maxWidth: 200,
        }}
      >
        {courses.map((c) => (
          <option key={c.id} value={c.id}>
            {c.title}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={run}
        disabled={pending || !courseId}
        style={{
          padding: "7px 12px",
          borderRadius: 8,
          border: "none",
          background: "var(--ink)",
          color: "#fff",
          font: "600 12px var(--sans)",
          cursor: pending ? "default" : "pointer",
          opacity: pending ? 0.6 : 1,
          whiteSpace: "nowrap",
        }}
      >
        {pending ? "…" : "Nadaj dostęp"}
      </button>
      {msg && (
        <span
          style={{
            fontSize: 11,
            color: msg.includes("✓") ? "#2E7D46" : "var(--accent)",
          }}
        >
          {msg}
        </span>
      )}
    </span>
  );
}
