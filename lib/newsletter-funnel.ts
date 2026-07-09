import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { queueAndSend } from "@/lib/emails";
import { renderCampaignContent } from "@/lib/newsletter";
import { PUBLIC_SITE } from "@/lib/site-url";

/**
 * Silnik lejka sprzedażowego newslettera.
 *
 * - enrollSubscriberInActiveSequences(): po potwierdzeniu zapisu (double
 *   opt-in) subskrybent wchodzi do wszystkich AKTYWNYCH sekwencji.
 * - processSequences(): wysyła zaległe kroki (wywoływane z crona oraz
 *   zaraz po potwierdzeniu zapisu, żeby krok 1 wyszedł od razu).
 * - stopSequencesForSubscriber(): wypis = natychmiastowy stop lejka.
 *
 * Zasady zgodności: wysyłamy WYŁĄCZNIE do status='subscribed' (podwójnie
 * potwierdzona zgoda), każdy mail w markowym szablonie z osobistym linkiem
 * wypisu i nagłówkami List-Unsubscribe (dziedziczone z queueAndSend).
 */

const DAY_MS = 24 * 60 * 60 * 1000;

export async function enrollSubscriberInActiveSequences(
  subscriberId: string
): Promise<void> {
  const admin = createSupabaseAdmin();
  const { data: sequences } = await admin
    .from("newsletter_sequences")
    .select("id")
    .eq("status", "active");
  if (!sequences?.length) return;

  for (const s of sequences) {
    await enrollSubscriber(admin, s.id as string, subscriberId);
  }
}

/** Zapisz subskrybenta do sekwencji (idempotentnie). */
export async function enrollSubscriber(
  admin: SupabaseClient,
  sequenceId: string,
  subscriberId: string
): Promise<void> {
  const { data: firstStep } = await admin
    .from("newsletter_sequence_steps")
    .select("delay_days")
    .eq("sequence_id", sequenceId)
    .eq("position", 1)
    .maybeSingle();
  if (!firstStep) return; // sekwencja bez kroków - nie zapisujemy

  const nextSendAt = new Date(
    Date.now() + (firstStep.delay_days as number) * DAY_MS
  ).toISOString();

  // unikat (sequence_id, subscriber_id) -> ponowny zapis jest no-op
  await admin
    .from("newsletter_sequence_progress")
    .upsert(
      {
        sequence_id: sequenceId,
        subscriber_id: subscriberId,
        next_position: 1,
        next_send_at: nextSendAt,
      },
      { onConflict: "sequence_id,subscriber_id", ignoreDuplicates: true }
    );
}

/** Wypis z newslettera zatrzymuje wszystkie lejki tej osoby. */
export async function stopSequencesForSubscriber(
  subscriberId: string,
  reason = "unsubscribed"
): Promise<void> {
  const admin = createSupabaseAdmin();
  await admin
    .from("newsletter_sequence_progress")
    .update({ stopped_reason: reason })
    .eq("subscriber_id", subscriberId)
    .is("completed_at", null)
    .is("stopped_reason", null);
}

/**
 * Wyślij zaległe kroki sekwencji (kolejność: najstarsze najpierw).
 * Zwraca liczbę wysłanych / zatrzymanych / ukończonych.
 */
export async function processSequences(
  limit = 200
): Promise<{ sent: number; stopped: number; completed: number }> {
  const admin = createSupabaseAdmin();
  const nowIso = new Date().toISOString();
  let sent = 0;
  let stopped = 0;
  let completed = 0;

  const { data: due } = await admin
    .from("newsletter_sequence_progress")
    .select(
      "id, sequence_id, subscriber_id, next_position, newsletter_sequences(status, stop_for_customers), newsletter_subscribers(id, email, status, unsubscribe_token)"
    )
    .is("completed_at", null)
    .is("stopped_reason", null)
    .lte("next_send_at", nowIso)
    .order("next_send_at", { ascending: true })
    .limit(limit);

  for (const row of due ?? []) {
    const seq = row.newsletter_sequences as unknown as {
      status: string;
      stop_for_customers: boolean;
    } | null;
    const sub = row.newsletter_subscribers as unknown as {
      id: string;
      email: string;
      status: string;
      unsubscribe_token: string;
    } | null;
    if (!seq || seq.status !== "active" || !sub) continue; // pauza -> czeka

    // wypisany w międzyczasie -> stop
    if (sub.status !== "subscribed") {
      await admin
        .from("newsletter_sequence_progress")
        .update({ stopped_reason: "unsubscribed" })
        .eq("id", row.id);
      stopped++;
      continue;
    }

    // już kupił kurs -> nie sprzedajemy drugi raz (o ile sekwencja tak każe)
    if (seq.stop_for_customers) {
      const { data: prof } = await admin
        .from("profiles")
        .select("id")
        .eq("email", sub.email)
        .maybeSingle();
      if (prof) {
        const { count } = await admin
          .from("enrollments")
          .select("*", { count: "exact", head: true })
          .eq("user_id", prof.id)
          .eq("status", "active");
        if ((count ?? 0) > 0) {
          await admin
            .from("newsletter_sequence_progress")
            .update({ stopped_reason: "customer" })
            .eq("id", row.id);
          stopped++;
          continue;
        }
      }
    }

    const { data: step } = await admin
      .from("newsletter_sequence_steps")
      .select("id, subject, preheader, content, cta_label, cta_url")
      .eq("sequence_id", row.sequence_id)
      .eq("position", row.next_position)
      .maybeSingle();

    if (!step) {
      // brak kolejnego kroku -> lejek ukończony
      await admin
        .from("newsletter_sequence_progress")
        .update({ completed_at: nowIso })
        .eq("id", row.id);
      completed++;
      continue;
    }

    const unsubscribeUrl = `${PUBLIC_SITE}/api/newsletter/unsubscribe?token=${sub.unsubscribe_token}`;
    await queueAndSend("newsletter_campaign", sub.email, {
      subject: step.subject,
      preheader: step.preheader,
      contentHtml: renderCampaignContent(
        step.content as string,
        step.cta_label as string | null,
        step.cta_url as string | null
      ),
      unsubscribeUrl,
    });
    sent++;

    // zaplanuj następny krok (albo zakończ, jeśli to był ostatni)
    const { data: nextStep } = await admin
      .from("newsletter_sequence_steps")
      .select("delay_days")
      .eq("sequence_id", row.sequence_id)
      .eq("position", (row.next_position as number) + 1)
      .maybeSingle();

    if (nextStep) {
      await admin
        .from("newsletter_sequence_progress")
        .update({
          next_position: (row.next_position as number) + 1,
          next_send_at: new Date(
            Date.now() + (nextStep.delay_days as number) * DAY_MS
          ).toISOString(),
        })
        .eq("id", row.id);
    } else {
      await admin
        .from("newsletter_sequence_progress")
        .update({ completed_at: nowIso })
        .eq("id", row.id);
      completed++;
    }
  }

  return { sent, stopped, completed };
}
