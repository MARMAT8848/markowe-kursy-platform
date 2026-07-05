/**
 * Nadaje/odbiera rolę administratora.
 *   npm run make-admin -- <email>            # nadaj
 *   npm run make-admin -- <email> --remove   # odbierz
 *
 * Rola admina to wpis w tabeli admin_users (źródło prawdy dla is_admin()).
 */
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
try {
  for (const line of readFileSync(path.join(root, ".env.local"), "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {}

const email = process.argv[2];
const remove = process.argv.includes("--remove");
if (!email) {
  console.error("Użycie: npm run make-admin -- <email> [--remove]");
  process.exit(1);
}

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const run = async () => {
  const { data: list, error: le } = await admin.auth.admin.listUsers();
  if (le) throw le;
  const user = list.users.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  );
  if (!user) {
    console.error(`Nie znaleziono użytkownika: ${email} (musi mieć konto).`);
    process.exit(1);
  }

  if (remove) {
    const { error } = await admin.from("admin_users").delete().eq("user_id", user.id);
    if (error) throw error;
    console.log(`Odebrano rolę admina: ${email}`);
  } else {
    const { error } = await admin
      .from("admin_users")
      .upsert({ user_id: user.id, role: "admin" }, { onConflict: "user_id" });
    if (error) throw error;
    // pole informacyjne w profiles (źródłem prawdy pozostaje admin_users)
    await admin.from("profiles").update({ role: "admin" }).eq("id", user.id);
    console.log(`Nadano rolę admina: ${email}`);
  }
};

run().catch((e) => {
  console.error("Błąd:", e.message);
  process.exit(1);
});
