/**
 * Wgrywa migracje (supabase/migrations/*.sql, w kolejności nazw) + seed.
 *
 * Użycie:  npm run db:apply
 * Wymaga w .env.local:  SUPABASE_DB_PASSWORD=...
 * Rejestr zastosowanych migracji: tabela public._migrations.
 * Seed jest idempotentny (ON CONFLICT DO NOTHING) — zawsze wykonywany.
 */
import { readFileSync, readdirSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import pg from "pg";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

try {
  for (const line of readFileSync(path.join(root, ".env.local"), "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {}

const PROJECT_REF = "fxcxqykdirbdnzjochxx";
const password = process.env.SUPABASE_DB_PASSWORD;
if (!password) {
  console.error("Brak SUPABASE_DB_PASSWORD w .env.local (Settings → Database).");
  process.exit(1);
}

const connectionString = `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(password)}@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`;
const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });

const run = async () => {
  await client.connect();

  await client.query(
    `create table if not exists public._migrations (
       name text primary key, applied_at timestamptz not null default now()
     )`
  );
  // starsze wdrożenie: 0001 wgrana zanim istniał rejestr
  const { rows: legacy } = await client.query(
    "select to_regclass('public.profiles') as t"
  );
  if (legacy[0].t) {
    await client.query(
      "insert into public._migrations (name) values ('0001_init.sql') on conflict do nothing"
    );
  }

  const dir = path.join(root, "supabase", "migrations");
  const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
  const { rows: appliedRows } = await client.query(
    "select name from public._migrations"
  );
  const applied = new Set(appliedRows.map((r) => r.name));

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`Migracja ${file}: już zastosowana — pomijam.`);
      continue;
    }
    console.log(`Migracja ${file}: wgrywam…`);
    await client.query(readFileSync(path.join(dir, file), "utf8"));
    await client.query("insert into public._migrations (name) values ($1)", [file]);
    console.log(`Migracja ${file}: OK`);
  }

  console.log("Seed: wgrywam dane startowe…");
  await client.query(readFileSync(path.join(root, "supabase", "seed.sql"), "utf8"));
  console.log("Seed: OK");

  const c = await client.query(
    `select (select count(*) from public.courses) as courses,
            (select count(*) from public.bundles) as bundles,
            (select count(*) from public.lessons) as lessons`
  );
  console.log(
    `Stan bazy → kursy: ${c.rows[0].courses}, ścieżki: ${c.rows[0].bundles}, lekcje: ${c.rows[0].lessons}`
  );
  await client.end();
};

run().catch(async (e) => {
  console.error("Błąd:", e.message);
  try { await client.end(); } catch {}
  process.exit(1);
});
