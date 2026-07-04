/**
 * Wgrywa strukturę bazy (migracje) + dane startowe (seed) do Supabase.
 *
 * Użycie:  npm run db:apply
 * Wymaga w .env.local:  SUPABASE_DB_PASSWORD=...  (Settings → Database)
 * Bezpieczne do wielokrotnego uruchamiania: migracja pomijana, jeśli
 * tabele już istnieją; seed jest idempotentny (ON CONFLICT DO NOTHING).
 */
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import pg from "pg";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

// wczytaj .env.local (node bez dodatkowych zależności)
try {
  for (const line of readFileSync(path.join(root, ".env.local"), "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {}

const PROJECT_REF = "fxcxqykdirbdnzjochxx";
const password = process.env.SUPABASE_DB_PASSWORD;
if (!password) {
  console.error(
    "Brak SUPABASE_DB_PASSWORD w .env.local.\n" +
      "Znajdziesz je w Supabase → Settings → Database (lub zresetuj tam hasło)."
  );
  process.exit(1);
}

// Session pooler (IPv4-friendly) — region eu-central-1
const connectionString = `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(password)}@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`;

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

const run = async () => {
  await client.connect();

  const { rows } = await client.query(
    "select to_regclass('public.profiles') as t"
  );
  if (rows[0].t) {
    console.log("Migracja 0001: tabele już istnieją — pomijam.");
  } else {
    console.log("Migracja 0001: wgrywam strukturę bazy…");
    const sql = readFileSync(
      path.join(root, "supabase", "migrations", "0001_init.sql"),
      "utf8"
    );
    await client.query(sql);
    console.log("Migracja 0001: OK");
  }

  console.log("Seed: wgrywam dane startowe…");
  const seed = readFileSync(path.join(root, "supabase", "seed.sql"), "utf8");
  await client.query(seed);
  console.log("Seed: OK");

  const counts = await client.query(
    `select
       (select count(*) from public.courses) as courses,
       (select count(*) from public.bundles) as bundles,
       (select count(*) from public.lessons) as lessons`
  );
  console.log(
    `Stan bazy → kursy: ${counts.rows[0].courses}, ścieżki: ${counts.rows[0].bundles}, lekcje: ${counts.rows[0].lessons}`
  );
  await client.end();
};

run().catch(async (e) => {
  console.error("Błąd:", e.message);
  try {
    await client.end();
  } catch {}
  process.exit(1);
});
