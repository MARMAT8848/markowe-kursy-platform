import { NextResponse } from "next/server";
import { verifyCron } from "@/lib/cron";
import { processOutbox } from "@/lib/emails";

/** Cron: ponawia wysyłkę zaległych e-maili z outbox. */
export async function GET(req: Request) {
  if (!verifyCron(req)) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const result = await processOutbox(100);
  return NextResponse.json({ ok: true, ...result });
}
