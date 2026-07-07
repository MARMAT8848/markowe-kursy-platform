"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import {
  grantAccess,
  extendAccess,
  revokeAccess,
} from "@/lib/enrollments";
import { generateCertificate } from "@/lib/certificates/generate";

/** Adres serwisu z nagłówków realnego żądania administratora — pomija
 *  błędnie ustawioną zmienną środowiskową (np. localhost). */
async function currentSiteUrl(): Promise<string | undefined> {
  const h = await headers();
  const host = h.get("host");
  if (!host || host.includes("localhost")) return undefined;
  const proto = h.get("x-forwarded-proto") || "https";
  return `${proto}://${host}`;
}

/**
 * Akcje panelu admina. KAŻDA na wejściu wywołuje requireAdmin() —
 * nie ufamy, że wywołanie akcji pochodzi z panelu. Zwracają { ok, error }.
 */

export async function grantAccessAction(formData: FormData) {
  const { admin } = await requireAdmin();
  const userId = String(formData.get("userId"));
  const courseId = String(formData.get("courseId"));
  if (!userId || !courseId) return { ok: false, error: "Brak danych." };
  const res = await grantAccess(admin, userId, courseId, { months: 12 });
  revalidatePath("/admin/enrollments");
  revalidatePath("/admin/users");
  return res;
}

export async function extendAccessAction(formData: FormData) {
  const { admin } = await requireAdmin();
  const enrollmentId = String(formData.get("enrollmentId"));
  const res = await extendAccess(admin, enrollmentId, 12);
  revalidatePath("/admin/enrollments");
  return res;
}

export async function revokeAccessAction(formData: FormData) {
  const { admin } = await requireAdmin();
  const enrollmentId = String(formData.get("enrollmentId"));
  const res = await revokeAccess(admin, enrollmentId);
  revalidatePath("/admin/enrollments");
  return res;
}

export async function toggleCourseStatusAction(formData: FormData) {
  const { admin } = await requireAdmin();
  const courseId = String(formData.get("courseId"));
  const current = String(formData.get("current"));
  const next = current === "published" ? "coming_soon" : "published";
  const { error } = await admin
    .from("courses")
    .update({ status: next })
    .eq("id", courseId);
  revalidatePath("/admin/courses");
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function revokeCertificateAction(formData: FormData) {
  const { admin } = await requireAdmin();
  const certId = String(formData.get("certId"));
  const { error } = await admin
    .from("certificates")
    .update({ status: "revoked", revoked_at: new Date().toISOString() })
    .eq("id", certId);
  revalidatePath("/admin/certificates");
  return error ? { ok: false, error: error.message } : { ok: true };
}

/**
 * Ponowna generacja certyfikatu. Unieważnia obecny (zwalnia unikalny
 * indeks „jeden aktywny na enrollment") i generuje nowy z aktualnym
 * imieniem i nazwiskiem.
 */
export async function regenerateCertificateAction(formData: FormData) {
  const { admin } = await requireAdmin();
  const certId = String(formData.get("certId"));

  const { data: cert } = await admin
    .from("certificates")
    .select("id, user_id, course_id, enrollment_id, status")
    .eq("id", certId)
    .maybeSingle();
  if (!cert) return { ok: false, error: "Nie znaleziono certyfikatu." };

  if (cert.status === "generated") {
    await admin
      .from("certificates")
      .update({ status: "revoked", revoked_at: new Date().toISOString() })
      .eq("id", certId);
  }

  const [{ data: profile }, { data: courseTr }] = await Promise.all([
    admin.from("profiles").select("full_name").eq("id", cert.user_id).single(),
    admin
      .from("course_translations")
      .select("title")
      .eq("course_id", cert.course_id)
      .eq("language", "pl")
      .single(),
  ]);

  try {
    await generateCertificate({
      userId: cert.user_id,
      courseId: cert.course_id,
      enrollmentId: cert.enrollment_id,
      fullName: profile?.full_name || "Kursant",
      courseTitle: courseTr?.title || "Kurs",
      siteUrl: await currentSiteUrl(),
    });
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Błąd generacji." };
  }
  revalidatePath("/admin/certificates");
  return { ok: true };
}
