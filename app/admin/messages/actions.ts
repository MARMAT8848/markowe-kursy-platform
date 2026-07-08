"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";

type ActionResult = { ok: boolean; error?: string };

/** Oznacz wiadomość jako załatwioną / cofnij oznaczenie. */
export async function toggleHandledAction(
  formData: FormData
): Promise<ActionResult> {
  const { admin } = await requireAdmin();
  const id = String(formData.get("messageId") ?? "");
  const handled = String(formData.get("handled") ?? "") === "true";
  if (!id) return { ok: false, error: "Brak identyfikatora." };

  const { error } = await admin
    .from("contact_messages")
    .update({ handled_at: handled ? null : new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, error: "Nie udało się zapisać." };

  revalidatePath("/admin/messages");
  return { ok: true };
}

/** Usuń wiadomość (np. spam). */
export async function deleteMessageAction(
  formData: FormData
): Promise<ActionResult> {
  const { admin } = await requireAdmin();
  const id = String(formData.get("messageId") ?? "");
  if (!id) return { ok: false, error: "Brak identyfikatora." };

  const { error } = await admin.from("contact_messages").delete().eq("id", id);
  if (error) return { ok: false, error: "Nie udało się usunąć." };

  revalidatePath("/admin/messages");
  return { ok: true };
}
