import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

const BUCKET = process.env.CERTIFICATE_STORAGE_BUCKET || "certificates";

/**
 * GET /api/certificates/[certificateId]/download
 *
 * Autoryzowane pobranie PDF z prywatnego bucketa. Tylko właściciel
 * certyfikatu (lub admin). Działa także PO wygaśnięciu dostępu do kursu
 * (wymóg biznesowy) — ale nie dla certyfikatów unieważnionych.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ certificateId: string }> }
) {
  const { certificateId } = await params;

  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  }

  const admin = createSupabaseAdmin();
  const { data: cert } = await admin
    .from("certificates")
    .select("id, user_id, status, certificate_number, pdf_storage_path")
    .eq("id", certificateId)
    .maybeSingle();

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!cert || (cert.user_id !== user.id && isAdmin !== true)) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  if (cert.status !== "generated" || !cert.pdf_storage_path) {
    return NextResponse.json(
      { error: "REVOKED", message: "Certyfikat został unieważniony." },
      { status: 410 }
    );
  }

  const { data: file, error } = await admin.storage
    .from(BUCKET)
    .download(cert.pdf_storage_path);
  if (error || !file) {
    return NextResponse.json({ error: "FILE_MISSING" }, { status: 404 });
  }

  const filename = `certyfikat-${cert.certificate_number.replaceAll("/", "-")}.pdf`;
  return new NextResponse(await file.arrayBuffer(), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
