import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import QRCode from "qrcode";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { publicSiteUrl } from "@/lib/site-url";

/**
 * Certyfikaty PDF (ETAP 17).
 * - Generacja wyłącznie server-side, po ukończeniu kursu.
 * - Idempotentna: częściowy unikalny indeks „jeden aktywny certyfikat
 *   na enrollment" + sprawdzenie przed generacją.
 * - Zapis w PRYWATNYM buckecie Storage; pobieranie tylko przez
 *   autoryzowany endpoint.
 * - Numer: MK/ROK/NNNNN (sekwencja w bazie), slug weryfikacyjny: losowy.
 */

const BUCKET = process.env.CERTIFICATE_STORAGE_BUCKET || "certificates";

const INK = rgb(0.086, 0.086, 0.086);
const ACCENT = rgb(0.882, 0.071, 0.102);
const MUTED = rgb(0.435, 0.435, 0.435);

async function ensureBucket(admin: ReturnType<typeof createSupabaseAdmin>) {
  const { error } = await admin.storage.createBucket(BUCKET, {
    public: false,
  });
  if (error && !/already exists/i.test(error.message)) throw error;
}

async function loadAsset(rel: string) {
  return fs.readFile(path.join(process.cwd(), rel));
}

export interface GeneratedCertificate {
  id: string;
  certificateNumber: string;
  verificationSlug: string;
}

export async function generateCertificate(input: {
  userId: string;
  courseId: string;
  enrollmentId: string;
  fullName: string;
  courseTitle: string;
  /** Adres serwisu do zakodowania w QR/linku weryfikacyjnym. Przekazywany
   *  przez wywołującego z prawdziwego żądania (req origin) — nie polegamy
   *  wyłącznie na zmiennej środowiskowej, żeby błędna/nieustawiona wartość
   *  (np. localhost) nigdy nie trafiła na wydany certyfikat. */
  siteUrl?: string;
}): Promise<GeneratedCertificate> {
  const admin = createSupabaseAdmin();

  // idempotencja: istniejący aktywny certyfikat dla tego enrollmentu
  const { data: existing } = await admin
    .from("certificates")
    .select("id, certificate_number, verification_slug")
    .eq("enrollment_id", input.enrollmentId)
    .eq("status", "generated")
    .maybeSingle();
  if (existing) {
    return {
      id: existing.id,
      certificateNumber: existing.certificate_number,
      verificationSlug: existing.verification_slug,
    };
  }

  const { data: numberData, error: numErr } = await admin.rpc(
    "next_certificate_number"
  );
  if (numErr || !numberData) {
    throw new Error("Nie udało się nadać numeru certyfikatu: " + numErr?.message);
  }
  const certificateNumber = numberData as string;
  const verificationSlug = crypto.randomUUID().replaceAll("-", "");
  const issuedAt = new Date();

  const site = input.siteUrl || publicSiteUrl();
  const verifyUrl = `${site}/verify-certificate/${verificationSlug}`;

  // ---------- PDF (A4 poziomo, typografia IBM Plex jak na stronie) ----------
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const [sans, sansSemi, mono, monoSemi] = await Promise.all([
    loadAsset("content/fonts/IBMPlexSans-Regular.ttf").then((b) => pdf.embedFont(b, { subset: true })),
    loadAsset("content/fonts/IBMPlexSans-SemiBold.ttf").then((b) => pdf.embedFont(b, { subset: true })),
    loadAsset("content/fonts/IBMPlexMono-Regular.ttf").then((b) => pdf.embedFont(b, { subset: true })),
    loadAsset("content/fonts/IBMPlexMono-SemiBold.ttf").then((b) => pdf.embedFont(b, { subset: true })),
  ]);
  const logoPng = await pdf.embedPng(await loadAsset("public/assets/logo.png"));
  const qrPng = await pdf.embedPng(
    await QRCode.toBuffer(verifyUrl, { margin: 0, width: 256 })
  );

  const page = pdf.addPage([841.89, 595.28]);
  const { width, height } = page.getSize();
  const M = 56;

  // górny pasek akcentu + ramka
  page.drawRectangle({ x: 0, y: height - 8, width, height: 8, color: ACCENT });
  page.drawRectangle({
    x: 28, y: 28, width: width - 56, height: height - 64,
    borderColor: rgb(0.906, 0.902, 0.894), borderWidth: 1,
  });

  // nagłówek (letterhead): wordmark po lewej, numer po prawej
  page.drawText("MARKOWE", { x: M, y: height - M - 6, size: 15, font: sansSemi, color: INK });
  const mkW = sansSemi.widthOfTextAtSize("MARKOWE ", 15);
  page.drawText("KURSY", { x: M + mkW, y: height - M - 6, size: 15, font: sansSemi, color: ACCENT });
  page.drawText("AKADEMIA TECHNICZNA", { x: M, y: height - M - 20, size: 7.5, font: mono, color: MUTED });

  const numLabel = `CERTYFIKAT NR ${certificateNumber}`;
  const numW = monoSemi.widthOfTextAtSize(numLabel, 10);
  page.drawText(numLabel, { x: width - M - numW, y: height - M - 6, size: 10, font: monoSemi, color: INK });

  const center = (text: string, y: number, size: number, font: typeof sans, color = INK) => {
    const w = font.widthOfTextAtSize(text, size);
    page.drawText(text, { x: (width - w) / 2, y, size, font, color });
  };

  // wyeksponowane logo — emblemat wyśrodkowany nad tytułem
  const embH = 62;
  const embW = (logoPng.width / logoPng.height) * embH;
  page.drawImage(logoPng, {
    x: (width - embW) / 2,
    y: 452,
    width: embW,
    height: embH,
  });

  // treść centralna
  center("CERTYFIKAT UKOŃCZENIA KURSU", 424, 13, monoSemi, ACCENT);
  center("Zaświadcza się, że", 380, 13, sans, MUTED);
  center(input.fullName, 330, 38, sansSemi, INK);
  page.drawRectangle({ x: (width - 64) / 2, y: 312, width: 64, height: 3, color: ACCENT });
  center("ukończył(a) kurs online", 282, 13, sans, MUTED);

  // tytuł kursu (łamanie na 2 linie przy długich nazwach)
  const titleSize = 21;
  const maxTitleWidth = width - 2 * (M + 60);
  if (sansSemi.widthOfTextAtSize(input.courseTitle, titleSize) <= maxTitleWidth) {
    center(input.courseTitle, 248, titleSize, sansSemi, INK);
  } else {
    const words = input.courseTitle.split(" ");
    let line1 = "";
    let i = 0;
    while (
      i < words.length &&
      sansSemi.widthOfTextAtSize(line1 + words[i] + " ", titleSize) <= maxTitleWidth
    ) {
      line1 += words[i] + " ";
      i++;
    }
    center(line1.trim(), 254, titleSize, sansSemi, INK);
    center(words.slice(i).join(" "), 228, titleSize, sansSemi, INK);
  }

  const dateLabel = `DATA UKOŃCZENIA: ${issuedAt.toLocaleDateString("pl-PL")}`;
  center(dateLabel, 190, 10, mono, MUTED);

  // stopka: zastrzeżenie + QR z linkiem weryfikacyjnym
  page.drawText(
    "Certyfikat potwierdza ukończenie kursu na platformie Markowe Kursy (markowekursy.pl).",
    { x: M, y: 78, size: 8.5, font: sans, color: MUTED }
  );
  page.drawText(
    "Nie stanowi dokumentu urzędowego ani świadectwa kwalifikacji zawodowych.",
    { x: M, y: 66, size: 8.5, font: sans, color: MUTED }
  );
  page.drawText("WERYFIKACJA:", { x: M, y: 50, size: 7.5, font: monoSemi, color: INK });
  page.drawText(verifyUrl, { x: M + 62, y: 50, size: 7.5, font: mono, color: MUTED });

  const qrSize = 84;
  page.drawImage(qrPng, { x: width - M - qrSize, y: 48, width: qrSize, height: qrSize });

  const pdfBytes = await pdf.save();

  // ---------- Storage (prywatny) + rekord w bazie ----------
  await ensureBucket(admin);
  const storagePath = `${input.userId}/${verificationSlug}.pdf`;
  const { error: upErr } = await admin.storage
    .from(BUCKET)
    .upload(storagePath, Buffer.from(pdfBytes), {
      contentType: "application/pdf",
      upsert: true,
    });
  if (upErr) throw new Error("Zapis PDF do storage nie powiódł się: " + upErr.message);

  const { data: cert, error: insErr } = await admin
    .from("certificates")
    .insert({
      user_id: input.userId,
      course_id: input.courseId,
      enrollment_id: input.enrollmentId,
      certificate_number: certificateNumber,
      verification_slug: verificationSlug,
      status: "generated",
      issued_at: issuedAt.toISOString(),
      pdf_storage_path: storagePath,
    })
    .select("id")
    .single();
  if (insErr) {
    // wyścig z równoległym żądaniem — indeks częściowy zadziałał
    const { data: raced } = await admin
      .from("certificates")
      .select("id, certificate_number, verification_slug")
      .eq("enrollment_id", input.enrollmentId)
      .eq("status", "generated")
      .maybeSingle();
    if (raced) {
      return {
        id: raced.id,
        certificateNumber: raced.certificate_number,
        verificationSlug: raced.verification_slug,
      };
    }
    throw new Error("Zapis certyfikatu nie powiódł się: " + insErr.message);
  }

  return { id: cert.id, certificateNumber, verificationSlug };
}
