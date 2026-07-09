import { NextResponse } from "next/server";
import { verifyCron } from "@/lib/cron";
import { processOutbox } from "@/lib/emails";
import { processSequences } from "@/lib/newsletter-funnel";

/**
 * Cron: najpierw wysyła zaległe kroki lejków (kolejkuje je do outbox),
 * potem przetwarza cały outbox (kroki + reszta transakcyjnych).
 */
export async function GET(req: Request) {
  if (!verifyCron(req)) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const sequences = await processSequences(500);
  const outbox = await processOutbox(200);
  return NextResponse.json({ ok: true, sequences, outbox });
}
