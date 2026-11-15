/**
 * Forward-only migration runner.
 *
 * Applies every `drizzle/*.sql` file, in filename order, that hasn't been applied
 * yet, each in its own transaction, as the privileged `app_owner` role. Applied
 * files are recorded in `_migrations` so re-runs are no-ops.
 *
 * Run from the repo root: `bun run db:migrate`.
 */
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import postgres from 'postgres';

const MIGRATIONS_DIR = join(import.meta.dir, '..', 'drizzle');

async function main(): Promise<void> {
  const url = process.env.DATABASE_ADMIN_URL;
  if (!url) throw new Error('Missing DATABASE_ADMIN_URL (privileged role for migrations)');

  const sql = postgres(url, { max: 1, onnotice: () => {} });
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS _migrations (
        name       text PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now()
      )
    `;

    const files = (await readdir(MIGRATIONS_DIR))
      .filter((f) => f.endsWith('.sql'))
      .sort((a, b) => a.localeCompare(b));

    const applied = new Set(
      (await sql<{ name: string }[]>`SELECT name FROM _migrations`).map((r) => r.name),
    );

    let ran = 0;
    for (const file of files) {
      if (applied.has(file)) continue;
      const content = await readFile(join(MIGRATIONS_DIR, file), 'utf8');
      await sql.begin(async (tx) => {
        await tx.unsafe(content);
        await tx`INSERT INTO _migrations (name) VALUES (${file})`;
      });
      // eslint-disable-next-line no-console
      console.log(`✓ applied ${file}`);
      ran++;
    }

    // eslint-disable-next-line no-console
    console.log(ran === 0 ? 'Up to date — no migrations to apply.' : `Applied ${ran} migration(s).`);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
