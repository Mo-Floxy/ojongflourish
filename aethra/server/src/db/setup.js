import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDatabase, pool, query } from './pool.js';
import { env } from '../config/env.js';

const here = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  console.log(`→ Creating database ${env.db.name} if needed…`);
  await createDatabase();

  const schema = await fs.readFile(path.join(here, 'schema.sql'), 'utf8');
  const statements = schema
    .split(';')
    .map((statement) =>
      statement
        .split('\n')
        .filter((line) => !line.trim().startsWith('--'))
        .join('\n')
        .trim(),
    )
    .filter(Boolean);

  console.log(`→ Applying ${statements.length} schema statements…`);
  for (const statement of statements) {
    await query(statement);
  }

  const tables = await query(
    `SELECT TABLE_NAME AS name FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME`,
    [env.db.name],
  );
  console.log('✓ Database ready. Tables:');
  for (const table of tables) console.log(`  - ${table.name}`);
}

main()
  .then(async () => {
    await pool.end();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('✗ Database setup failed:', error.message);
    await pool.end().catch(() => {});
    process.exit(1);
  });
